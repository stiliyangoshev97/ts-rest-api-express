/**
 * User Management Controller Module
 * 
 * This module contains HTTP request handlers for user-related operations including
 * CRUD operations, user queries, and profile management. Controllers handle the HTTP
 * layer by receiving requests, validating input, calling business logic services,
 * and formatting responses for clients.
 * 
 * @module UserController
 * 
 * Endpoints provided:
 * - POST   /api/users - Create new user (admin functionality)
 * - GET    /api/users - Get all users with filtering/pagination
 * - GET    /api/users/:id - Get specific user by ID
 * - PUT    /api/users/:id - Update user information (self-only)
 * - DELETE /api/users/:id - Delete user account (self-only)
 * 
 * @example
 * ```typescript
 * // Usage in routes
 * import * as userController from './user.controller.js';
 * 
 * router.get('/users', authenticate, userController.getUsers);
 * router.get('/users/:id', authenticate, requireSelfAccess, userController.getUserById);
 * router.put('/users/:id', authenticate, requireSelfAccess, userController.updateUser);
 * ```
 */

import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/common.types.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import * as userService from './user.service.js';
import type { CreateUserData, UpdateUserData, UserQueryParams } from './user.types.js';

/**
 * Create a new user account
 * 
 * Administrative endpoint for creating user accounts. Regular user registration
 * should use the /api/auth/register endpoint instead. This is typically used
 * by admin interfaces or bulk user creation.
 * 
 * @route POST /api/users
 * @access Private (requires authentication, future: admin role)
 * 
 * @param req - Express request containing user creation data
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 201 with created user data
 * 
 * @throws {ApiError} 400 - When validation fails or required fields missing
 * @throws {ApiError} 409 - When user with email already exists
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/users \
 *   -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "newuser@example.com",
 *     "password": "securePassword123",
 *     "name": "New User"
 *   }'
 * ```
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userData: CreateUserData = req.body;

  const user = await userService.createUser(userData);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

/**
 * Get all users with filtering and pagination
 * 
 * Retrieves a list of users with support for filtering, sorting, and pagination.
 * Supports query parameters for customizing results.
 * 
 * @route GET /api/users
 * @access Private (requires authentication)
 * 
 * @param req - Express request with optional query parameters
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with paginated user list
 * 
 * @throws {ApiError} 401 - When authentication is required but not provided
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - sort: Sort field (e.g., 'name', 'email', 'createdAt')
 * - search: Search in name/email fields
 * 
 * @example
 * ```bash
 * # Get first page with default settings
 * curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   http://localhost:3000/api/users
 * 
 * # Get second page with 5 users per page, sorted by name
 * curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   "http://localhost:3000/api/users?page=2&limit=5&sort=name"
 * 
 * # Search for users containing "john"
 * curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   "http://localhost:3000/api/users?search=john"
 * ```
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const queryParams: UserQueryParams = req.query as any;

  const result = await userService.getUsers(queryParams);

  res.status(200).json(result);
});

/**
 * Get user by ID
 * 
 * Retrieves a specific user's information by their unique ID. Users can typically
 * only access their own profile unless they have admin privileges.
 * 
 * @route GET /api/users/:id
 * @access Private (requires authentication + self-access)
 * 
 * @param req - Express request with user ID in route parameters
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with user data
 * 
 * @throws {ApiError} 400 - When user ID is missing or invalid format
 * @throws {ApiError} 401 - When authentication is required but not provided
 * @throws {ApiError} 403 - When trying to access another user's profile
 * @throws {ApiError} 404 - When user with specified ID doesn't exist
 * 
 * @example
 * ```bash
 * curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   http://localhost:3000/api/users/60f7c8a5b8c9e4a1234567890
 * ```
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError('User ID is required', 400);
  }

  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

/**
 * Update user information
 * 
 * Allows users to update their profile information. Users can only update their
 * own profile data for security reasons. Supports partial updates.
 * 
 * @route PUT /api/users/:id
 * @access Private (requires authentication + self-access)
 * 
 * @param req - Express request with user ID and update data
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with updated user data
 * 
 * @throws {ApiError} 400 - When user ID is missing or validation fails
 * @throws {ApiError} 401 - When authentication is required but not provided
 * @throws {ApiError} 403 - When trying to update another user's profile
 * @throws {ApiError} 404 - When user with specified ID doesn't exist
 * @throws {ApiError} 409 - When email already exists (if updating email)
 * 
 * @example
 * ```bash
 * curl -X PUT http://localhost:3000/api/users/60f7c8a5b8c9e4a1234567890 \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "Updated Name",
 *     "email": "newemail@example.com"
 *   }'
 * ```
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;
  const updateData: UpdateUserData = req.body;

  if (!id) {
    throw new ApiError('User ID is required', 400);
  }

  // Users can only update their own profile
  if (authReq.user.id !== id) {
    throw new ApiError('You can only update your own profile', 403);
  }

  const user = await userService.updateUser(id, updateData);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

/**
 * Delete user account
 * 
 * Permanently deletes a user account. Users can only delete their own account
 * for security reasons. This action is irreversible and removes all user data.
 * 
 * @route DELETE /api/users/:id
 * @access Private (requires authentication + self-access)
 * 
 * @param req - Express request with user ID in route parameters
 * @param res - Express response object
 * 
 * @returns Promise<void> - HTTP 200 with deletion confirmation
 * 
 * @throws {ApiError} 400 - When user ID is missing or invalid format
 * @throws {ApiError} 401 - When authentication is required but not provided
 * @throws {ApiError} 403 - When trying to delete another user's account
 * @throws {ApiError} 404 - When user with specified ID doesn't exist
 * 
 * @example
 * ```bash
 * curl -X DELETE http://localhost:3000/api/users/60f7c8a5b8c9e4a1234567890 \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 * ```
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;

  if (!id) {
    throw new ApiError('User ID is required', 400);
  }

  // Users can only delete their own profile
  if (authReq.user.id !== id) {
    throw new ApiError('You can only delete your own profile', 403);
  }

  await userService.deleteUser(id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

