import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import AppError from '../lib/app-error';

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: 'Duplicate field value',
      code: 'DUPLICATE_ERROR',
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid resource ID',
      code: 'INVALID_ID',
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};

export default errorHandler;
