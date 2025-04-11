import { Request, Response } from 'express';

import { logger } from '../utils/logger';

// Importación de la configuración del agente y creación del servicio
// Necesitamos acceder al mismo servicio que usa el agentController
// Para mantener el mismo contexto y herramientas

// Dos opciones:

// Opción 1: Importar el agentService directamente (recomendada)
// Esto requiere exportar el agentService desde agent.controller.ts
// Añade esto a agent.controller.ts: export { agentService };
import { agentService } from './agent.controller';

// Opción 2: Recrear la misma configuración (alternativa)
// Esto duplica código pero funciona si no puedes modificar el agent.controller.ts
/*
const defaultTools = [
  {
    name: 'current_time',
    description: 'Get the current time',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      return { time: new Date().toLocaleString() };
    }
  },
  // ... otras herramientas
];

const agentConfig = {
  name: 'Asistente IA',
  description: 'Un asistente inteligente que puede responder preguntas y realizar tareas.',
  model: config.openai.model,
  tools: defaultTools,
  temperature: 0.7,
  useKnowledgeBase: true
};

const agentService = new AgentService(agentConfig);
*/

export const webhookController = {
  async handleWhatsAppWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Lógica específica para webhooks de WhatsApp
      const { entry } = req.body;

      if (!entry || !entry.length) {
        res.status(400).json({ error: 'Formato de webhook inválido' });
        return;
      }

      // Procesar mensajes de WhatsApp
      for (const entryItem of entry) {
        if (entryItem.changes && entryItem.changes.length) {
          for (const change of entryItem.changes) {
            if (change.value && change.value.messages && change.value.messages.length) {
              for (const message of change.value.messages) {
                if (message.type === 'text') {
                  const userId = message.from;
                  const text = message.text.body;

                  // Procesar el mensaje con el agente
                  const response = await agentService.processMessage(userId, text);

                  // Aquí se enviaría la respuesta de vuelta a WhatsApp
                  // (Requiere implementación de WhatsApp API)
                  logger.info(`Respuesta para WhatsApp (${userId}): ${response}`);
                }
              }
            }
          }
        }
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error('Error in WhatsApp webhook:', error);
      res.status(500).json({ error: 'Error al procesar webhook de WhatsApp' });
    }
  },

  async handleTelegramWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Lógica específica para webhooks de Telegram
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ error: 'Formato de webhook inválido' });
        return;
      }

      const userId = `telegram-${message.from.id}`;
      const text = message.text;

      if (text) {
        // Procesar el mensaje con el agente
        const response = await agentService.processMessage(userId, text);

        // Aquí se enviaría la respuesta de vuelta a Telegram
        // (Requiere implementación de Telegram Bot API)
        logger.info(`Respuesta para Telegram (${userId}): ${response}`);
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error('Error in Telegram webhook:', error);
      res.status(500).json({ error: 'Error al procesar webhook de Telegram' });
    }
  },
};
