import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { agentRoutes } from './routes/agent.routes';

import { errorHandler } from './utils/error-handler';
import { logger } from './utils/logger';
import { webhookRoutes } from './routes/webhook.routes';

export const createApp = () => {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Rutas
  app.use('/api/agent', agentRoutes);
  app.use('/api/webhook', webhookRoutes);

  // Ruta de salud
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Manejador de errores
  app.use(errorHandler);

  return app;
};
