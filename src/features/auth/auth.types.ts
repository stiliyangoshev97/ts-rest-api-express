/**
 * Authentication-Related Types
 * 
 * This file contains all TypeScript types and interfaces related to authentication.
 * Includes login credentials, JWT payloads, and authentication responses.
 */

import type { IUser } from '../users/user.types.js';

/**
 * User registration data - what we need to register a new user
 */
export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  age: number;
}

/**
 * Login credentials - what user provides to log in
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Password change data - for changing user password
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Password reset request data - for requesting password reset
 */
export interface PasswordResetRequestData {
  email: string;
}

/**
 * Password reset data - for actually resetting password with token
 */
export interface PasswordResetData {
  token: string;
  newPassword: string;
}

/**
 * JWT token payload - what we store inside JWT tokens
 */
export interface JwtTokenPayload {
  id: string;           // User ID
  email: string;        // User email
  iat?: number;         // Issued at timestamp
  exp?: number;         // Expiration timestamp
}

/**
 * Authentication response - what we return after successful login/register
 */
export interface AuthResponse {
  success: true;
  message: string;
  data: {
    user: Omit<IUser, 'password'>;  // User data without password
    token: string;                   // JWT token
  };
}

/**
 * Token verification result
 */
export interface TokenVerificationResult {
  valid: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}

/**
 * Auth session information for logging purposes
 */
export interface AuthSession {
  userId: string;
  email: string;
  loginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}
