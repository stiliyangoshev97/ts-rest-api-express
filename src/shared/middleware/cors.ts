/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * CORS allows your API to be called from web browsers running on different domains.
 * This is essential when your frontend (React app) runs on a different port/domain
 * than your backend API.
 */

import cors from 'cors';
import { env } from '../config/env.js'; // Import environment variables
import { logger } from '../config/logger.js'; // Import logger

/**
 * Get allowed origins based on environment
 * In development: Allow common development ports
 * In production: Only allow your actual domain(s)
 */

const getAllowedOrigins = (): string[] => {
    if (env.NODE_ENV === 'production') {
      return [
        'https://yourdomain.com',      // Your production domain
        'https://www.yourdomain.com',  // WWW version
        'https://app.yourdomain.com'   // App subdomain
      ];
    }

    // Development origins - common ports for React, Vite, etc.
    return [
        'http://localhost:3000',  // Create React App default
        'http://localhost:3001',  // Alternative React port
        'http://localhost:5173',  // Vite default
        'http://localhost:4173',  // Vite preview
        'http://127.0.0.1:3000',  // Alternative localhost format
    ];
}

// CORS middleware configuration
const corsMiddleware = cors({
    // Dynamic origin checking
    origin: (origin: string | undefined, callback) => {
        const allowedOrigins = getAllowedOrigins();

        // Allow requests with no origin (mobile apps, Postman, curl, etc..)
        if (!origin) {
            logger.debug('CORS: No origin - allowing request');
            return callback(null, true);
        }

        // Check if the origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
            logger.debug(`CORS: Allowed origin: ${origin}`);
            return callback(null, true);
        } else {
            logger.warn(`CORS: Blocked origin: ${origin}`);
            return callback(new Error('CORS policy: This origin is not allowed'));
        }
    },

    credentials: true, // Allow cookies and auth headers

    // HTTP methods that are allowed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

    // Preflight cache duration (in seconds)
    maxAge: 600,
    
})

export { corsMiddleware };