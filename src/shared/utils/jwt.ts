/**
 * JWT (JSON Web Token) Utilities
 * 
 * This file contains utilities for creating, signing, and verifying JWT tokens
 * used for user authentication. JWTs are stateless tokens that contain
 * encoded user information and can be verified without a database lookup.
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from './ApiError.js';

// Interface for JWT payload (what we store inside the token)
export interface JwtPayload {
  id: string;           // User ID from database
  email: string;        // User email
  iat?: number;         // Issued at (automatically added by jsonwebtoken)
  exp?: number;         // Expires at (automatically added by jsonwebtoken)
}

/**
 * Generate a JWT token for a user
 * 
 * Creates a signed JWT token containing user information for authentication.
 * The token expires based on the JWT_EXPIRES_IN environment variable.
 * 
 * @param payload - User information to encode in the token
 * @param payload.id - User's unique database ID
 * @param payload.email - User's email address
 * @returns string - The signed JWT token
 * @throws {ApiError} When token generation fails
 * 
 * @example
 * ```typescript
 * const token = generateToken({ 
 *   id: '507f1f77bcf86cd799439011', 
 *   email: 'user@example.com' 
 * });
 * console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * ```
 */
export const generateToken = (payload: { id: string; email: string }): string => {
  try {
    logger.info(`Generating JWT token for user: ${payload.email}`);
    
    // Use environment variables directly - we know they work from our test
    const jwtSecret = process.env.JWT_SECRET || env.JWT_SECRET;
    const jwtExpires = process.env.JWT_EXPIRES_IN || env.JWT_EXPIRES_IN || '7d';
    
    if (!jwtSecret) {
      logger.error('JWT_SECRET not available');
      throw new Error('JWT_SECRET is required');
    }
    
    // Use any type to bypass TypeScript issues
    const token = (jwt as any).sign(payload, jwtSecret, { expiresIn: jwtExpires });
    
    logger.info(`JWT token generated successfully for user: ${payload.email}`);
    return token;
  } catch (error) {
    logger.error(`JWT generation failed: ${error}`);
    if (error instanceof Error) {
      logger.error(`Error details: ${error.message}`);
    }
    throw new ApiError('Failed to generate authentication token', 500);
  }
};

/**
 * Verify and decode a JWT token
 * 
 * Validates a JWT token's signature and expiration, then extracts the payload.
 * Performs type checking to ensure the token contains expected user data.
 * 
 * @param token - The JWT token to verify (without 'Bearer ' prefix)
 * @returns JwtPayload - The decoded and validated token payload
 * @throws {ApiError} When token is invalid, expired, or malformed
 * 
 * @example
 * ```typescript
 * try {
 *   const payload = verifyToken(userToken);
 *   console.log(`User ID: ${payload.id}, Email: ${payload.email}`);
 * } catch (error) {
 *   console.log('Token is invalid or expired');
 * }
 * ```
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    // Use environment variables directly and bypass TypeScript issues
    const jwtSecret = process.env.JWT_SECRET || env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not available for verification');
    }
    
    // Verify token signature and expiration with type bypass
    const decoded = (jwt as any).verify(token, jwtSecret) as jwt.JwtPayload;
    
    // Type guard to ensure we have the expected payload structure
    if (typeof decoded === 'object' && decoded && 'id' in decoded && 'email' in decoded) {
      logger.debug(`JWT token verified for user: ${decoded.email}`);
      return decoded as JwtPayload;
    }
    
    throw new ApiError('Invalid token structure', 401);
  } catch (error) {
    // Handle different types of JWT errors
    if ((error as any).name === 'JsonWebTokenError') {
      logger.warn(`Invalid JWT token: ${(error as Error).message}`);
      throw new ApiError('Invalid authentication token', 401);
    }
    
    if ((error as any).name === 'TokenExpiredError') {
      logger.warn('JWT token has expired');
      throw new ApiError('Authentication token has expired', 401);
    }
    
    logger.error(`JWT verification error: ${error}`);
    throw new ApiError('Authentication failed', 401);
  }
};
