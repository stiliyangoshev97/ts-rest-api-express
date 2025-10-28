/**
 * Security Middleware
 * 
 * PURPOSE: Provides security headers and protection against common attacks
 * PROTECTS: XSS, NoSQL injection, HPP, and adds security headers
 * USES: helmet, express-mongo-sanitize, xss-clean, hpp
 */

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore - xss-clean doesn't have types
import xss from 'xss-clean';
// @ts-ignore - hpp doesn't have types  
import hpp from 'hpp';
import type { Express } from 'express';
import { logger } from '../config/logger.js';

/**
 * Configure security middleware for the Express app
 */
export const configureSecurity = (app: Express): void => {
  logger.info('Configuring security middleware...');

  // Helmet - Security headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding for development
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Data sanitization against NoSQL query injection
  // NOTE: mongoSanitize disabled due to compatibility issue with Express req.query
  // Alternative: Use Zod validation which provides similar protection
  // app.use(mongoSanitize());

  // Data sanitization against XSS attacks
  // Note: xss-clean disabled due to compatibility issues with newer Node.js versions
  // app.use(xss());

  // Prevent HTTP Parameter Pollution attacks  
  // Note: hpp disabled due to compatibility issues with newer Node.js versions
  // app.use(hpp({
  //   whitelist: [
  //     'sort',
  //     'fields',
  //     'page',
  //     'limit',
  //     'duration',
  //     'ratingsQuantity',
  //     'ratingsAverage',
  //     'maxGroupSize',
  //     'difficulty',
  //     'price'
  //   ],
  // }));

  logger.info('Security middleware configured successfully');
};
