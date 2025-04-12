import { openaiClient } from '../config/openai';
import { AgentConfig, Tool, Message } from '../models/agent.model';
import { vectorService } from './vector.service';
import { logger } from '../utils/logger';

export class AgentService {
  private tools: Tool[] = [];
  private config: AgentConfig;

  constructor(agentConfig: AgentConfig) {
    this.config = agentConfig;
    this.tools = agentConfig.tools || [];
  }

  async processMessage(userId: string, message: string): Promise<string> {
    try {
      // Construir el historial de mensajes para el contexto
      const messages: Message[] = [
        {
          role: 'system',
          content: `Eres ${this.config.name}, ${this.config.description}`,
        },
        { role: 'user', content: message },
      ];

      // Si se usa base de conocimiento, buscar información relevante
      let contextInfo = '';
      if (this.config.useKnowledgeBase) {
        const relevantInfo = await vectorService.searchSimilarDocuments(message, userId);
        if (relevantInfo) {
          contextInfo = `Información relevante del cliente: ${relevantInfo}\n\n`;
          messages[0].content += `\n\nUsa esta información contextual cuando sea relevante: ${contextInfo}`;
        }
      }

      // Preparar las herramientas para OpenAI - Corrigiendo el tipo
      const openAITools =
        this.tools.length > 0
          ? this.tools.map(tool => ({
              type: 'function' as const, // Tipo explícito con 'as const'
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
              },
            }))
          : undefined;

      // Llamar a la API de OpenAI
      const response = await openaiClient.chat.completions.create({
        model: this.config.model,
        messages: messages as any,
        tools: openAITools,
        temperature: this.config.temperature,
      });

      const responseMessage = response.choices[0].message;

      // Procesar llamadas a herramientas si existen
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          // Buscar la herramienta correspondiente
          const tool = this.tools.find(t => t.name === toolName);
          if (tool) {
            try {
              const toolResult = await tool.handler(toolArgs);

              // Añadir el resultado de la herramienta al contexto
              // Corregido: eliminado el campo 'name' para mensajes de asistente
              messages.push({
                role: 'assistant',
                content: '',
              });

              messages.push({
                role: 'function',
                name: toolName,
                content: JSON.stringify(toolResult),
              });

              // Hacer una segunda llamada a la API con el resultado de la herramienta
              const secondResponse = await openaiClient.chat.completions.create({
                model: this.config.model,
                messages: messages as any,
                temperature: this.config.temperature,
              });

              return secondResponse.choices[0].message.content || '';
            } catch (error) {
              logger.error(`Error executing tool ${toolName}:`, error);
              return `Error al ejecutar la herramienta ${toolName}. Por favor, inténtalo de nuevo.`;
            }
          }
        }
      }

      return responseMessage.content || '';
    } catch (error) {
      logger.error('Error in agent service:', error);
      throw new Error('Error al procesar el mensaje');
    }
  }

  registerTool(tool: Tool): void {
    this.tools.push(tool);
  }
}
