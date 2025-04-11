import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Algo salió mal' : err.message,
  });
};
