import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.warn({ message: 'Route not found', path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
};