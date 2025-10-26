/**
 * Common Shared Types
 * 
 * This file contains utility types and interfaces that are used across
 * multiple features and don't belong to any specific domain.
 */

import type { Request } from 'express';

/**
 * Extended Express Request with authenticated user
 * This extends the base Express Request to include user info after auth
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

/**
 * Database connection status
 */
export interface DatabaseStatus {
  connected: boolean;
  host?: string;
  database?: string;
  error?: string;
}

/**
 * Application health status - for health check endpoint
 */
export interface HealthStatus {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  database: DatabaseStatus;
  memory: {
    used: number;
    total: number;
  };
}
