/**
 * Simple Error Handler Middleware
 * 
 * Basic error handling without complex dependencies that cause issues
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

/**
 * Global error handling middleware
 * Must be the last middleware in the stack
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error(`Error: ${err.message || 'Unknown error'}`);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
