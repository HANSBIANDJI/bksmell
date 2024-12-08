import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (_req: Request, res: Response, _next: NextFunction) => {
  return (error: AppError) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      message
    });
  };
};