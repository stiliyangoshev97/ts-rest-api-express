/**
 * Logger Configuration
 * 
 * This file sets up Pino logger for structured logging.
 * In development: Pretty formatted logs with colors
 * In production: JSON formatted logs for log aggregation
 */

import pino from 'pino';
import { env} from './env.js'; // We use env.js and not env.ts because of ES module resolution

const isProd = env.NODE_ENV === 'production';

// Build logger options and only include transport in non-production to avoid `undefined` union types
const loggerOptions: pino.LoggerOptions = {
    // Set log level based on environment
    level: isProd ? 'info' : 'debug',
    // In development, use pretty formatting for better readability
    ...(isProd ? {} : {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true, // Add colors to log output
                ignore: 'pid,hostname', // Ignore process ID and hostname fields
                translateTime: 'SYS:standard' // Human-readable timestamp
            }
        }
    })
};

// Create logger instance with environment-specific configuration
export const logger = pino(loggerOptions);