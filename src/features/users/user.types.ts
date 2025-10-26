/**
 * User-Related Types
 * 
 * This file contains all TypeScript types and interfaces related to users.
 * Includes user data structures, creation/update payloads, and query parameters.
 */

/**
 * User interface - represents a user in the system
 */
export interface IUser {
  id: string;           // Virtual ID field (same as _id but as string)
  name: string;         // User's display name
  email: string;        // User's email address (unique)
  password: string;     // Hashed password
  age: number;          // User age
  passwordResetToken?: string;   // Token for password reset
  passwordResetExpires?: Date;   // Expiry date for password reset token
  createdAt: Date;      // When the user was created
  updatedAt: Date;      // When the user was last updated
}

/**
 * User creation data - what we need to create a new user
 */
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  age: number;
}

/**
 * User update data - what fields can be updated
 */
export interface UpdateUserData {
  name?: string;        // Optional name update
  age?: number;         // Optional age update
  // Note: email and password updates are handled separately
}

/**
 * Query parameters for filtering users
 */
export interface UserQueryParams {
  page?: number;        // Page number for pagination
  limit?: number;       // Items per page
  age?: number;         // Filter by specific age
  sortBy?: 'name' | 'email' | 'age' | 'createdAt';  // Sort field
  sortOrder?: 'asc' | 'desc';  // Sort direction
  search?: string;      // Search term for name or email
}
