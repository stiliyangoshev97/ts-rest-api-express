/**
 * Environment Variables Configuration
 * 
 * This file validates and parses all environment variables using Zod.
 * It ensures that required variables are present and have correct formats.
 * If validation fails, the app won't start - this prevents runtime errors.
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
    // Application environment (development, production, test)
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Port where the server will run
    PORT: z.string().default('3000').transform(Number),

    // MongoDB connection string - required for database connection
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

    // JWT secret for signing tokens - must be at least 32 characters for security
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),

    // How long JWT tokens are valid (e.g., '1h', '7d')
    JWT_EXPIRES_IN: z.string().default('7d'),

    // Number of rounds for bcrypt hashing - higher = more secure but slower
    BCRYPT_ROUND: z.string().default('12').transform(Number),

    // Allowed origin for CORS (comma-separated list)
    CORS_ORIGINS: z.string()
        .default('http://localhost:3000, http://localhost:3001')
        .transform(str => str.split(',')),

    // Main frontend URL
    FRONTEND_URL: z.string().default('http://localhost:3000'),

})

// Parse and validate the environment variables
export const env = envSchema.parse(process.env);