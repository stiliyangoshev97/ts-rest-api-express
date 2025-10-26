/**
 * Auth Validation Schemas - INPUT VALIDATION LAYER
 * 
 * PURPOSE: Validates HTTP request data (body, params, query) from API clients
 * WHEN: Runs at the API middleware layer before reaching controllers
 * VALIDATES: Raw incoming HTTP requests for authentication endpoints
 * CATCHES: Malformed requests, missing fields, wrong data types, invalid formats
 * 
 * This file contains Zod schemas for validating auth-related requests
 * like login, register, password operations. These schemas ensure
 * API input integrity and provide clear validation messages to clients.
 */

import { z } from 'zod';

/**
 * Schema for user registration
 */
export const registerUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must be at most 100 characters long')
      .trim()
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z.string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255, 'Email must be at most 255 characters long'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters long')
      .max(128, 'Password must be at most 128 characters long')
      .regex(/^\S+$/, 'Password cannot contain spaces'),
    age: z.number()
      .int('Age must be an integer')
      .min(13, 'Age must be at least 13')
      .max(120, 'Age must be at most 120'),
  })
});

/**
 * Schema for user login
 */
export const loginUserSchema = z.object({
  body: z.object({
    email: z.string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255, 'Email must be at most 255 characters long'),
    password: z.string()
      .min(1, 'Password is required')
      .max(128, 'Password must be at most 128 characters long'),
  })
});

/**
 * Schema for changing password
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required')
      .max(128, 'Current password must be at most 128 characters long'),
    newPassword: z.string()
      .min(6, 'New password must be at least 6 characters long')
      .max(128, 'New password must be at most 128 characters long')
      .regex(/^\S+$/, 'New password cannot contain spaces'),
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
});

/**
 * Schema for password reset request
 */
export const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255, 'Email must be at most 255 characters long'),
  })
});

/**
 * Schema for password reset (with token)
 */
export const passwordResetSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Reset token is required')
      .max(500, 'Invalid reset token format'),
    newPassword: z.string()
      .min(6, 'New password must be at least 6 characters long')
      .max(128, 'New password must be at most 128 characters long')
      .regex(/^\S+$/, 'New password cannot contain spaces'),
  })
});

/**
 * Schema for token verification
 */
export const verifyTokenSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Token is required'),
  })
});

/**
 * Schema for refresh token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
      .min(1, 'Refresh token is required'),
  })
});

// Export the inferred types for use in controllers
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
