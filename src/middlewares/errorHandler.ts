import { Request, Response, NextFunction } from 'express';
import { Logger } from '../config/logger';

export class CustomError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const logger = Logger.getInstance();
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (statusCode === 500) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
