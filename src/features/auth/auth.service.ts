/**
 * Authentication Service Module
 * 
 * This module contains all business logic for authentication-related operations.
 * It serves as the bridge between controllers and data models, handling complex
 * business rules, validation, and data transformations.
 * 
 * @module AuthService
 * 
 * Core Responsibilities:
 * - User registration and account creation
 * - User authentication and login validation
 * - JWT token generation and verification
 * - Password management (change, reset, validation)
 * - User profile retrieval for authenticated users
 * - Security token generation for password resets
 * 
 * @example
 * ```typescript
 * import * as authService from './auth.service.js';
 * 
 * // Register new user
 * const result = await authService.registerUser({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe'
 * });
 * 
 * // Login user
 * const loginResult = await authService.loginUser({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * ```
 */

import { User, type UserDocument } from '../users/user.model.js';
import type { IUser } from '../users/user.types.js';
import type { 
  RegisterUserData, 
  LoginCredentials, 
  ChangePasswordData,
  PasswordResetRequestData,
  PasswordResetData,
  AuthResponse,
  TokenVerificationResult,
  JwtTokenPayload
} from './auth.types.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { logger } from '../../shared/config/logger.js';
import * as JWT from '../../shared/utils/jwt.js';
import { comparePassword } from '../../shared/utils/password.js';
import crypto from 'crypto';

/**
 * Register a new user account
 * 
 * Creates a new user account with provided registration data. Validates that
 * email is unique, creates the user record, and returns authentication data
 * with JWT token for immediate login.
 * 
 * @param userData - User registration information
 * @returns Promise resolving to authentication response with user data and JWT token
 * 
 * @throws {ApiError} 409 - When user with email already exists
 * @throws {ApiError} 400 - When validation fails or required data is missing
 * @throws {ApiError} 500 - When database operation fails
 * 
 * @example
 * ```typescript
 * const result = await registerUser({
 *   email: 'john@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe'
 * });
 * 
 * console.log(result.token); // JWT token for authentication
 * console.log(result.user.email); // john@example.com
 * ```
 */
export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  try {
    logger.info(`Starting user registration for: ${userData.email}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError('Email already registered', 409);
    }

    logger.info(`No existing user found, creating new user: ${userData.email}`);

    // Create new user (password will be hashed by mongoose middleware)
    const user = new User(userData);
    await user.save();

    logger.info(`User saved to database: ${userData.email}, _id: ${user._id}`);

    // Generate JWT token
    logger.info(`Attempting to generate JWT token for user: ${userData.email}`);
    const token = JWT.generateToken({ id: (user._id as any).toString(), email: user.email });

    logger.info(`User registered successfully: ${user.email}`);
    
    // Return success response with user data (password excluded by toJSON) and token
    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON() as IUser,
        token
      }
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error during user registration: ${error}`);
    throw new ApiError('Registration failed', 500);
  }
};

/**
 * Authenticate user login
 * 
 * Validates user credentials (email and password) and returns authentication
 * data with JWT token if credentials are correct.
 * 
 * @param credentials - User login credentials (email and password)
 * @returns Promise resolving to authentication response with user data and JWT token
 * 
 * @throws {ApiError} 401 - When email doesn't exist or password is incorrect
 * @throws {ApiError} 400 - When credentials are missing or invalid format
 * @throws {ApiError} 500 - When database operation fails
 * 
 * @example
 * ```typescript
 * const result = await loginUser({
 *   email: 'john@example.com',
 *   password: 'securePassword123'
 * });
 * 
 * console.log(result.token); // JWT token for authentication
 * console.log(result.user.id); // User ID for further requests
 * ```
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: credentials.email }).select('+password');
    
    if (!user) {
      throw new ApiError('Invalid login credentials', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid login credentials', 401);
    }

    // Generate JWT token
    const token = JWT.generateToken({ id: (user._id as any).toString(), email: user.email });

    logger.info(`User logged in successfully: ${user.email}`);
    
    // Return success response with user data (password excluded by toJSON) and token
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON() as IUser,
        token
      }
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error during user login: ${error}`);
    throw new ApiError('Login failed', 500);
  }
};

/**
 * Change user's password
 * 
 * Allows authenticated users to change their password by verifying the current
 * password and updating to a new one. Ensures security by requiring current password.
 * 
 * @param userId - ID of the authenticated user
 * @param passwordData - Object containing current and new password
 * @returns Promise resolving to success confirmation
 * 
 * @throws {ApiError} 404 - When user with given ID doesn't exist
 * @throws {ApiError} 401 - When current password is incorrect
 * @throws {ApiError} 400 - When new password doesn't meet requirements
 * @throws {ApiError} 500 - When database operation fails
 * 
 * @example
 * ```typescript
 * const result = await changePassword('60f7c8a5b8c9e4a123456789', {
 *   currentPassword: 'oldPassword123',
 *   newPassword: 'newSecurePassword456'
 * });
 * 
 * console.log(result.message); // "Password changed successfully"
 * ```
 */
export const changePassword = async (
  userId: string, 
  passwordData: ChangePasswordData
): Promise<{ success: true; message: string }> => {
  try {
    // Find user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      passwordData.currentPassword, 
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new ApiError('Current password is incorrect', 400);
    }

    // Update password (will be hashed by mongoose middleware)
    user.password = passwordData.newPassword;
    await user.save();

    logger.info(`Password changed successfully for user: ${user.email}`);
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error changing password: ${error}`);
    throw new ApiError('Password change failed', 500);
  }
};

/**
 * Request password reset (generates reset token)
 */
export const requestPasswordReset = async (
  requestData: PasswordResetRequestData
): Promise<{ success: true; message: string; resetToken?: string }> => {
  try {
    // Find user by email
    const user = await User.findOne({ email: requestData.email });
    
    if (!user) {
      // Don't reveal whether email exists or not
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      };
    }

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token and expiry in user document
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    logger.info(`Password reset requested for user: ${user.email}`);
    
    // In production, you'd send the resetToken via email
    // For development/demo purposes, we return it in the response
    return {
      success: true,
      message: 'Password reset token generated',
      resetToken // Remove this in production!
    };
  } catch (error) {
    logger.error(`Error requesting password reset: ${error}`);
    throw new ApiError('Password reset request failed', 500);
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (
  resetData: PasswordResetData
): Promise<{ success: true; message: string }> => {
  try {
    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: resetData.token,
      passwordResetExpires: { $gt: new Date() } // Token not expired
    });
    
    if (!user) {
      throw new ApiError('Invalid or expired reset token', 400);
    }

    // Update password (will be hashed by mongoose middleware)
    user.password = resetData.newPassword;
    
    // Clear reset token fields
    user.passwordResetToken = null as any;
    user.passwordResetExpires = null as any;
    
    await user.save();

    logger.info(`Password reset successfully for user: ${user.email}`);
    
    return {
      success: true,
      message: 'Password reset successful'
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error resetting password: ${error}`);
    throw new ApiError('Password reset failed', 500);
  }
};

/**
 * Verify JWT token
 */
export const verifyAuthToken = async (token: string): Promise<TokenVerificationResult> => {
  try {
    const decoded = JWT.verifyToken(token) as JwtTokenPayload;
    
    // Optionally verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return {
        valid: false,
        error: 'User no longer exists'
      };
    }
    
    return {
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email
      }
    };
  } catch (error) {
    logger.debug(`Token verification failed: ${error}`);
    return {
      valid: false,
      error: 'Invalid or expired token'
    };
  }
};

/**
 * Get authenticated user profile
 */
export const getAuthenticatedUserProfile = async (userId: string): Promise<IUser> => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    return user.toJSON() as IUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error getting user profile: ${error}`);
    throw new ApiError('Failed to get user profile', 500);
  }
};
