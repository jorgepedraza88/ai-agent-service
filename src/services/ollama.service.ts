import axios from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { Message } from '../models/agent.model';

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = config.ollama.url;
    this.defaultModel = config.ollama.model;
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    try {
      const useModel = model || this.defaultModel;
      const url = `${this.baseUrl}/api/chat`;

      // Convertir mensajes al formato esperado por Ollama
      const ollamaMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        // Ollama no utiliza el campo 'name' para mensajes de función
      }));

      const response = await axios.post(url, {
        model: useModel,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      });

      if (response.data && response.data.message && response.data.message.content) {
        return response.data.message.content;
      } else {
        throw new Error('Formato de respuesta inesperado de Ollama');
      }
    } catch (error) {
      logger.error('Error calling Ollama API:', error);
      throw new Error('Error al generar respuesta con Ollama');
    }
  }

  async generateEmbedding(text: string, model?: string): Promise<number[]> {
    try {
      const useModel = model || this.defaultModel;
      const url = `${this.baseUrl}/api/embeddings`;

      const response = await axios.post(url, {
        model: useModel,
        prompt: text,
      });

      if (response.data && response.data.embedding) {
        return response.data.embedding;
      } else {
        throw new Error('Formato de respuesta inesperado de Ollama para embedding');
      }
    } catch (error) {
      logger.error('Error generating embedding with Ollama:', error);
      throw new Error('Error al generar embedding con Ollama');
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/api/tags`;
      const response = await axios.get(url);

      if (response.data && response.data.models) {
        return response.data.models.map((model: any) => model.name);
      } else {
        return [];
      }
    } catch (error) {
      logger.error('Error listing Ollama models:', error);
      return [];
    }
  }
}

export const ollamaService = new OllamaService();
