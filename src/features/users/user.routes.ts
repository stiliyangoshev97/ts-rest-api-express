/**
 * User Routes
 * 
 * This file defines all HTTP routes for user-related endpoints.
 * It connects HTTP methods and paths to controller functions and applies middleware.
 */

import { Router } from 'express';
import * as userController from './user.controller.js';
import { validateRequest, validateParams, validateQuery } from '../../shared/middleware/validation.js';
import { authenticate, requireSelfAccess } from '../../shared/middleware/auth.js';
import { generalLimiter, createAccountLimiter } from '../../shared/middleware/rateLimiter.js';
import { 
  createUserSchema, 
  updateUserSchema, 
  userParamsSchema,
  getUsersSchema 
} from './user.schemas.js';

const router = Router();

/**
 * Protected routes (authentication required)
 * Note: User registration and profile retrieval are handled by auth routes
 */

// Get all users with filtering and pagination
router.get(
  '/',
  generalLimiter,
  authenticate,
  validateQuery(getUsersSchema.shape.query),
  userController.getUsers
);

// Get user by ID
router.get(
  '/:id',
  generalLimiter,
  authenticate,
  validateParams(userParamsSchema.shape.params), // shape.params extracts the params schema
  userController.getUserById
);

// Update user profile
router.put(
  '/:id',
  generalLimiter,
  authenticate,
  requireSelfAccess,
  validateParams(userParamsSchema.shape.params),
  validateRequest(updateUserSchema),
  userController.updateUser
);

// Delete user
router.delete(
  '/:id',
  generalLimiter,
  authenticate,
  requireSelfAccess,
  validateParams(userParamsSchema.shape.params),
  userController.deleteUser
);

export default router;
