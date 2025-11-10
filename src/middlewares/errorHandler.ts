import { NextFunction, Request, Response } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode ?? 500;
  const response: Record<string, unknown> = {
    message: err.message || 'Internal server error'
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

