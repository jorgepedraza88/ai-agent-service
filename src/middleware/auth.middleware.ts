import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export const authMiddleware = {
  apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.header(config.auth.apiKeyHeader);

    if (!apiKey || apiKey !== config.auth.apiKey) {
      logger.warn('Unauthorized API access attempt');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    next();
  },

  // Middleware específico para webhooks (puede incluir verificación de firma)
  webhookAuth(req: Request, res: Response, next: NextFunction): void {
    // Implementar lógica específica para cada servicio
    // Por ejemplo, WhatsApp usa un token de verificación específico

    // Para simplificar, en este ejemplo pasamos directamente
    next();
  },
};
