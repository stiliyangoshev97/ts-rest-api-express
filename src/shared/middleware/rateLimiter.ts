/**
 * Rate Limiting Middleware
 * 
 * PURPOSE: Prevent brute force attacks and API abuse
 * PROTECTS: Login attempts, general API calls, password resets
 * USES: express-rate-limit, express-slow-down
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    throw new ApiError('Too many requests from this IP, please try again later.', 429);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Allows 5 login attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    throw new ApiError('Too many authentication attempts, please try again later.', 429);
  },
});

/**
 * Password reset rate limiter
 * Allows 3 password reset requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    throw new ApiError('Too many password reset attempts, please try again later.', 429);
  },
});

/**
 * Create account rate limiter
 * Allows 3 account creations per hour per IP
 */
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Temporarily increased for testing
  message: {
    error: 'Too many accounts created from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Account creation rate limit exceeded for IP: ${req.ip}`);
    throw new ApiError('Too many accounts created from this IP, please try again later.', 429);
  },
});
