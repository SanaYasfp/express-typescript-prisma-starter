import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../interfaces/error-response.interface';

import { Logger } from '../utils';
import buildResponse from '../utils/build-response.util';

const logger = new Logger();

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.method} - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json(buildResponse({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  }));

  logger.error(err.message);
}
