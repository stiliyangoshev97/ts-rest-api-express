/**
 * Main Application Entry Point
 * 
 * This file sets up the Express application with all middleware,
 * routes, and configuration. It serves as the central orchestrator
 * of the entire REST API application.
 */

import express from 'express';
import type { Request, Response } from 'express';
import { env } from './shared/config/env.js';
import { logger } from './shared/config/logger.js';
import { connectDB } from './shared/config/database.js';

// Middleware imports
import { corsMiddleware } from './shared/middleware/cors.js';
import { configureSecurity } from './shared/middleware/security.js';
import { globalErrorHandler } from './shared/middleware/errorHandler.simple.js';

// Route imports
import userRoutes from './features/users/user.routes.js';
import authRoutes from './features/auth/auth.routes.js';

// Initialize Express application
const app = express();

/**
 * MIDDLEWARE SETUP
 * Order matters! These middleware are applied in sequence.
 */

// Security middleware (helmet, rate limiting, input sanitization)
configureSecurity(app);

// CORS configuration
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (handled by logger middleware in security)
logger.info('Express middleware configured');

/**
 * ROUTES SETUP
 */

// Health check endpoint removed - was causing issues

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TypeScript Express REST API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

// Handle undefined routes (404 handler)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

/**
 * GLOBAL ERROR HANDLER
 * Must be the last middleware
 */
app.use(globalErrorHandler);

/**
 * SERVER STARTUP
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📍 API endpoints available at http://localhost:${env.PORT}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

// Start the application
startServer();