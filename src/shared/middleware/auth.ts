/**
 * Authentication Middleware Module
 * 
 * This module provides comprehensive authentication and authorization middleware
 * for protecting API routes and managing user access control.
 * 
 * @module AuthMiddleware
 * 
 * Features:
 * - JWT token verification and validation
 * - User authentication and authorization
 * - Optional authentication for public routes
 * - Role-based access control (future enhancement)
 * - Self-access restriction for user resources
 * 
 * @example
 * ```typescript
 * // Protect a route with authentication
 * router.get('/profile', authenticate, getUserProfile);
 * 
 * // Optional authentication for mixed public/private content
 * router.get('/posts', optionalAuth, getPosts);
 * 
 * // Restrict access to specific roles
 * router.delete('/admin', authenticate, restrictTo('admin'), deleteUser);
 * 
 * // Ensure users can only access their own resources
 * router.get('/users/:id', authenticate, requireSelfAccess, getUserById);
 * ```
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/common.types.js';
import * as JWT from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { getUserByEmail } from '../../features/users/user.service.js';

/**
 * Extracts JWT token from the Authorization header
 * 
 * @param req - Express request object
 * @returns The JWT token string or null if not found
 * 
 * @example
 * ```typescript
 * // Header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * const token = extractToken(req); // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * ```
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  return null;
};

/**
 * Authentication middleware for protecting routes
 * 
 * Verifies JWT token from Authorization header, validates the user exists,
 * and adds user information to the request object for downstream middleware.
 * 
 * @param req - Express request object
 * @param res - Express response object  
 * @param next - Express next function
 * 
 * @throws {ApiError} 401 - When token is missing, invalid, or user doesn't exist
 * 
 * @example
 * ```typescript
 * // Protect a route
 * router.get('/profile', authenticate, (req, res) => {
 *   const user = (req as AuthenticatedRequest).user;
 *   res.json({ message: `Hello ${user.email}` });
 * });
 * 
 * // Usage with curl
 * curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/users/profile
 * ```
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header
    const token = extractToken(req);
    
    if (!token) {
      throw new ApiError('Access token is required. Please log in.', 401);
    }

    // Verify token
    const decoded = JWT.verifyToken(token);
    
    if (!decoded || !decoded.id || !decoded.email) {
      throw new ApiError('Invalid token. Please log in again.', 401);
    }

    // Check if user still exists
    const currentUser = await getUserByEmail(decoded.email);
    
    if (!currentUser) {
      throw new ApiError('The user belonging to this token no longer exists.', 401);
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = {
      id: (currentUser._id as any).toString(),
      email: currentUser.email,
    };

    logger.debug('User authenticated successfully');

    next();
  } catch (error) {
    logger.warn('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));

    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Authentication failed. Please log in again.', 401));
    }
  }
};

/**
 * Optional authentication middleware
 * 
 * Similar to authenticate() but doesn't throw errors if no token is provided.
 * Useful for routes that can work with or without authentication (e.g., public posts
 * that show different content for authenticated users).
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @example
 * ```typescript
 * // Mixed public/private content
 * router.get('/posts', optionalAuth, (req, res) => {
 *   const user = (req as AuthenticatedRequest).user;
 *   if (user) {
 *     // Show personalized content
 *     res.json({ posts: getPersonalizedPosts(user.id) });
 *   } else {
 *     // Show public content
 *     res.json({ posts: getPublicPosts() });
 *   }
 * });
 * ```
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // Verify token
    const decoded = JWT.verifyToken(token);
    
    if (!decoded || !decoded.id || !decoded.email) {
      // Invalid token, continue without authentication
      return next();
    }

    // Check if user still exists
    const currentUser = await getUserByEmail(decoded.email);
    
    if (!currentUser) {
      // User doesn't exist, continue without authentication
      return next();
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = {
      id: (currentUser._id as any).toString(),
      email: currentUser.email,
    };

    next();
  } catch (error) {
    // If any error occurs, just continue without authentication
    logger.debug('Optional authentication failed, continuing without auth');
    
    next();
  }
};

/**
 * Role-based authorization middleware factory
 * 
 * Creates middleware that restricts access to users with specific roles.
 * Currently validates authentication only - role checking is a future enhancement.
 * 
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 * 
 * @throws {ApiError} 401 - When user is not authenticated
 * @throws {ApiError} 403 - When user doesn't have required role (future)
 * 
 * @example
 * ```typescript
 * // Restrict to admin users only (future enhancement)
 * router.delete('/users/:id', authenticate, restrictTo('admin'), deleteUser);
 * 
 * // Restrict to multiple roles
 * router.post('/posts', authenticate, restrictTo('admin', 'moderator'), createPost);
 * ```
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      throw new ApiError('You must be logged in to access this resource.', 401);
    }

    // TODO: Implement role-based authorization when user roles are added
    // For now, just check if user is authenticated
    
    logger.debug('Access granted');

    next();
  };
};

/**
 * Self-access authorization middleware
 * 
 * Ensures that authenticated users can only access their own resources.
 * Compares the authenticated user's ID with the resource ID from route parameters.
 * 
 * @param req - Express request object (must contain user from authentication)
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @throws {ApiError} 401 - When user is not authenticated
 * @throws {ApiError} 400 - When resource ID is missing from route params
 * @throws {ApiError} 403 - When user tries to access another user's resource
 * 
 * @example
 * ```typescript
 * // Users can only access their own profile
 * router.get('/users/:id', authenticate, requireSelfAccess, getUserById);
 * 
 * // Users can only update their own data
 * router.put('/users/:id', authenticate, requireSelfAccess, updateUser);
 * 
 * // Usage with curl (user can only access their own ID)
 * curl -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/users/USER_ID
 * ```
 */
export const requireSelfAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;
  const resourceId = req.params.id;

  if (!authReq.user) {
    throw new ApiError('You must be logged in to access this resource.', 401);
  }

  if (!resourceId) {
    throw new ApiError('Resource ID is required.', 400);
  }

  // Check if user is accessing their own resource
  if (authReq.user.id !== resourceId) {
    throw new ApiError('You can only access your own resources.', 403);
  }

  logger.debug('Self-access granted');

  next();
};
