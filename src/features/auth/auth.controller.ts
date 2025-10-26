/**
 * Authentication Controller Module
 * 
 * This module contains HTTP request handlers for all authentication-related endpoints.
 * Controllers handle the HTTP layer: receiving requests, validating input, calling services,
 * and formatting responses for the client.
 * 
 * @module AuthController
 * 
 * Endpoints provided:
 * - POST /api/auth/register - User registration
 * - POST /api/auth/login - User authentication
 * - GET  /api/auth/me - Get authenticated user profile
 * - PATCH /api/auth/change-password - Change user password
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 * - POST /api/auth/verify-token - Verify JWT token validity
 * - POST /api/auth/logout - Logout user (client-side)
 * 
 * @example
 * ```typescript
 * // Usage in routes
 * import * as authController from './auth.controller.js';
 * 
 * router.post('/register', validateBody(registerSchema), authController.register);
 * router.post('/login', validateBody(loginSchema), authController.login);
 * router.get('/me', authenticate, authController.getProfile);
 * ```
 */

import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/common.types.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import * as authService from './auth.service.js';
import type { 
  RegisterUserData, 
  LoginCredentials, 
  ChangePasswordData,
  PasswordResetRequestData,
  PasswordResetData
} from './auth.types.js';

/**
 * Register a new user account
 * 
 * Creates a new user account with email and password. Validates that the email
 * is unique and password meets security requirements.
 * 
 * @route POST /api/auth/register
 * @access Public
 * 
 * @param req - Express request containing user registration data
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 201 with user data and JWT token
 * 
 * @throws {ApiError} 400 - When validation fails or required fields missing
 * @throws {ApiError} 409 - When user with email already exists
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/register \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "user@example.com",
 *     "password": "securePassword123",
 *     "name": "John Doe"
 *   }'
 * ```
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData: RegisterUserData = req.body;

  const result = await authService.registerUser(userData);

  res.status(201).json(result);
});

/**
 * Authenticate user login
 * 
 * Validates user credentials and returns a JWT token for authenticated requests.
 * 
 * @route POST /api/auth/login
 * @access Public
 * 
 * @param req - Express request containing login credentials
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with user data and JWT token
 * 
 * @throws {ApiError} 400 - When validation fails or credentials missing
 * @throws {ApiError} 401 - When credentials are invalid
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "user@example.com",
 *     "password": "securePassword123"
 *   }'
 * ```
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials: LoginCredentials = req.body;

  const result = await authService.loginUser(credentials);

  res.status(200).json(result);
});

/**
 * Get authenticated user's profile
 * 
 * Returns the current user's profile information. Requires valid JWT token.
 * 
 * @route GET /api/auth/me
 * @access Private (requires authentication)
 * 
 * @param req - Express request (with authenticated user from middleware)
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with user profile data
 * 
 * @throws {ApiError} 401 - When token is missing or invalid
 * @throws {ApiError} 404 - When user no longer exists
 * 
 * @example
 * ```bash
 * curl -X GET http://localhost:3000/api/auth/me \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 * ```
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // User is guaranteed to exist because of auth middleware
  const userId = (req as AuthenticatedRequest).user!.id;

  const user = await authService.getAuthenticatedUserProfile(userId);

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: user,
  });
});

/**
 * Change user's password
 * 
 * Allows authenticated users to change their password by providing current
 * password and new password. Validates current password before updating.
 * 
 * @route PATCH /api/auth/change-password
 * @access Private (requires authentication)
 * 
 * @param req - Express request containing current and new password
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with success message
 * 
 * @throws {ApiError} 400 - When validation fails or passwords don't meet requirements
 * @throws {ApiError} 401 - When current password is incorrect
 * 
 * @example
 * ```bash
 * curl -X PATCH http://localhost:3000/api/auth/change-password \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "currentPassword": "oldPassword123",
 *     "newPassword": "newSecurePassword456"
 *   }'
 * ```
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  // User is guaranteed to exist because of auth middleware
  const userId = (req as AuthenticatedRequest).user!.id;
  const passwordData: ChangePasswordData = req.body;

  const result = await authService.changePassword(userId, passwordData);

  res.status(200).json(result);
});

/**
 * Request password reset
 * 
 * Initiates password reset process by sending a reset token to user's email.
 * Creates a temporary reset token that expires after a set time.
 * 
 * @route POST /api/auth/forgot-password
 * @access Public
 * 
 * @param req - Express request containing user email
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with success message (always, for security)
 * 
 * @throws {ApiError} 400 - When email is missing or invalid format
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/forgot-password \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "user@example.com"
 *   }'
 * ```
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const requestData: PasswordResetRequestData = req.body;

  const result = await authService.requestPasswordReset(requestData);

  res.status(200).json(result);
});

/**
 * Reset password using reset token
 * 
 * Completes password reset process using the token sent to user's email.
 * Validates token and updates user's password if token is valid and not expired.
 * 
 * @route POST /api/auth/reset-password
 * @access Public
 * 
 * @param req - Express request containing reset token and new password
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with success message and new JWT token
 * 
 * @throws {ApiError} 400 - When token or password is missing/invalid
 * @throws {ApiError} 401 - When reset token is invalid or expired
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/reset-password \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "token": "reset_token_from_email",
 *     "newPassword": "newSecurePassword123"
 *   }'
 * ```
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const resetData: PasswordResetData = req.body;

  const result = await authService.resetPassword(resetData);

  res.status(200).json(result);
});

/**
 * Verify JWT token validity
 * 
 * Validates if a JWT token is still valid and returns user information.
 * Useful for client-side token validation and user session checks.
 * 
 * @route POST /api/auth/verify-token
 * @access Public
 * 
 * @param req - Express request containing JWT token to verify
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with token validity and user data
 * 
 * @throws {ApiError} 400 - When token is missing from request body
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/verify-token \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   }'
 * ```
 */
export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError('Token is required', 400);
  }

  const result = await authService.verifyAuthToken(token);

  if (!result.valid) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: result.error
    });
  }

  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: result.user
  });
});

/**
 * Logout user
 * 
 * Handles user logout. Since JWT tokens are stateless, actual logout is handled
 * client-side by removing the token. This endpoint provides consistency and
 * can be extended for future session management or token blacklisting.
 * 
 * @route POST /api/auth/logout
 * @access Public
 * 
 * @param req - Express request object
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with logout confirmation
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/logout \
 *   -H "Content-Type: application/json"
 * ```
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // JWT tokens are stateless, so logout is handled client-side by removing the token
  // This endpoint exists for consistency and potential future session management
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});
