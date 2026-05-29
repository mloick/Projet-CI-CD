import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler';

export const validateRequest = (schema: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = schema.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    next();
  };
};
