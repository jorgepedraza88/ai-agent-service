// src/controllers/agent.controller.ts
import { Request, Response } from 'express';
import { AgentService } from '../services/agent.service';
import { logger } from '../utils/logger';
import { config } from '../config/config';

// Definición mejorada de herramientas predefinidas
const defaultTools = [
  {
    name: 'current_time',
    description: 'Get the current time',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async () => {
      return { time: new Date().toLocaleString() };
    },
  },
  {
    name: 'search_customer_info',
    description: 'Search for customer information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
      },
      required: ['query'],
    },
    handler: async (args: { query: string }) => {
      // Simulación - en un entorno real, consultaría una base de datos
      return { result: `Información simulada para: ${args.query}` };
    },
  },
];

// Configuración del agente
const agentConfig = {
  name: 'Asistente IA',
  description: 'Un asistente inteligente que puede responder preguntas y realizar tareas.',
  model: config.openai.model,
  tools: defaultTools,
  temperature: 0.7,
  useKnowledgeBase: true,
};

// Crear instancia del servicio del agente
const agentService = new AgentService(agentConfig);

// Exportar agentService para uso en otros controladores
export { agentService };

export const agentController = {
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { userId, message } = req.body;

      if (!userId || !message) {
        res.status(400).json({ error: 'userId y message son campos requeridos' });
        return;
      }

      const response = await agentService.processMessage(userId, message);

      res.status(200).json({ response });
    } catch (error) {
      logger.error('Error processing message:', error);
      res.status(500).json({ error: 'Error al procesar el mensaje' });
    }
  },
};

/*
async processMessageWithOllama(req: Request, res: Response): Promise<void> {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      res.status(400).json({ error: 'userId y message son campos requeridos' });
      return;
    }
    
    const response = await agentService.processMessageWithOllama(userId, message);
    
    res.status(200).json({ response });
  } catch (error) {
    logger.error('Error processing message with Ollama:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje con Ollama' });
  }
}
*/
