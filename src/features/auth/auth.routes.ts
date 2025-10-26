/**
 * Auth Routes
 * 
 * This file defines all HTTP routes for authentication-related endpoints.
 * It connects HTTP methods and paths to controller functions and applies middleware.
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateRequest, validateBody } from '../../shared/middleware/validation.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { 
  generalLimiter, 
  authLimiter, 
  passwordResetLimiter, 
  createAccountLimiter 
} from '../../shared/middleware/rateLimiter.js';
import { 
  registerUserSchema,
  loginUserSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  verifyTokenSchema
} from './auth.schemas.js';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// User registration
router.post(
  '/register',
  generalLimiter,
  createAccountLimiter,
  validateRequest(registerUserSchema),
  authController.register
);

// User login
router.post(
  '/login',
  generalLimiter,
  authLimiter,
  validateRequest(loginUserSchema),
  authController.login
);

// Request password reset
router.post(
  '/forgot-password',
  generalLimiter,
  passwordResetLimiter,
  validateRequest(passwordResetRequestSchema),
  authController.forgotPassword
);

// Reset password with token
router.post(
  '/reset-password',
  generalLimiter,
  passwordResetLimiter,
  validateRequest(passwordResetSchema),
  authController.resetPassword
);

// Verify JWT token
router.post(
  '/verify-token',
  generalLimiter,
  validateRequest(verifyTokenSchema),
  authController.verifyToken
);

/**
 * Protected routes (authentication required)
 */

// Get authenticated user's profile
router.get(
  '/me',
  generalLimiter,
  authenticate,
  authController.getProfile
);

// Change password
router.patch(
  '/change-password',
  generalLimiter,
  passwordResetLimiter,
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

// Logout (client-side token removal)
router.post(
  '/logout',
  generalLimiter,
  authenticate,
  authController.logout
);

export default router;
