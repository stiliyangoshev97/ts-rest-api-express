/**
 * Central Type Export Hub
 * 
 * This file re-exports all types from individual feature and shared files,
 * making imports cleaner and providing a single entry point for all types.
 */

// User types
export type {
  IUser,
  CreateUserData,
  UpdateUserData,
  UserQueryParams,
} from '../../features/users/user.types.js';

// Auth types
export type {
  LoginCredentials,
  ChangePasswordData,
  JwtTokenPayload,
  AuthResponse,
} from '../../features/auth/auth.types.js';

// API types
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  ValidationError,
  RateLimitInfo,
} from './api.types.js';

// Common types
export type {
  AuthenticatedRequest,
  DatabaseStatus,
  HealthStatus,
} from './common.types.js';
