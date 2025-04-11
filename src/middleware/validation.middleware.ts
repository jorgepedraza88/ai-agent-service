import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const validationMiddleware = {
  validateAgentRequest(req: Request, res: Response, next: NextFunction): void {
    const { userId, message } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId es requerido' });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message debe ser un texto válido' });
      return;
    }

    next();
  },
};
