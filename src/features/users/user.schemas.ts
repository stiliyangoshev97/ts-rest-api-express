/**
 * User Validation Schemas - INPUT VALIDATION LAYER
 * 
 * PURPOSE: Validates HTTP request data (body, params, query) from API clients
 * WHEN: Runs at the API middleware layer before reaching controllers
 * VALIDATES: Raw incoming HTTP requests, query parameters, URL parameters
 * CATCHES: Malformed requests, missing fields, wrong data types, invalid formats
 * 
 * This file contains Zod schemas for validating user-related requests
 * like creating, updating, and querying users. These schemas ensure
 * API input integrity and provide clear validation messages to clients.
 * 
 * NOTE: These validations should match the database schema validations
 * in user.model.ts to maintain consistency across validation layers.
 */

import { z } from 'zod';

/**
 * Schema for creating a new user
 */

export const createUserSchema = z.object({
    body: z.object({ // body: z.object are fields that are expected in the body (POST/PUT requests)
        name: z.string()
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name must be at most 100 characters long')
            .trim() // Remove leading/trailing whitespace
            .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
        email: z.string()
            .email('Please provide a valid email address')
            .toLowerCase()
            .trim()
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
})

/**
 * Schema for updating user information
 * Only allows updating name and age (not email or password)
 */

export const updateUserSchema = z.object({
    body: z.object({ // body: z.object are fields that are expected in the body
        name: z.string()
            .min(2, 'Name must be at least 2 characters long')
            .max(50, 'Name must be at most 50 characters long')
            .trim() // Remove leading/trailing whitespace
            .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
            .optional(), // Name is optional for updates
        age: z.number()
            .int('Age must be an integer')
            .min(13, 'Age must be at least 13')
            .max(120, 'Age must be at most 120')
            .optional(), // Age is optional for updates

    })
    .refine(data => data.name || data.age !== undefined, { // Ensure at least one field is provided
        message: 'At least one field (name or age) must be provided for update',
    })
})

/**
 * Schema for user ID parameter validation
 */

export const userParamsSchema = z.object({
    params: z.object({ // params: z.object are fields that are expected in the URL parameters
        id: z.string()
            .min(1, 'User ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')

    })
})

/**
 * Schema for querying users with filters and pagination
 */

export const getUsersSchema = z.object({
    query: z.object({ // query: z.object are fields that are expected in the query string
      // Pagination
      page: z.string()
        .regex(/^\d+$/, 'Page must be a positive number')
        .transform(Number)
        .refine(num => num >= 1, 'Page must be at least 1')
        .default(1), // Default to page 1
      
      limit: z.string() // Limit as string
        .regex(/^\d+$/, 'Limit must be a positive number')
        .transform(Number)
        .refine(num => num >= 1 && num <= 100, 'Limit must be between 1 and 100') // .refine is used to add custom validation
        .default(10), // Default to 10 items per page
      
      // Filtering
      age: z.string() // Age filter as string
        .regex(/^\d+$/, 'Age must be a positive number')
        .transform(Number) // Convert to number
        .refine(num => num >= 13 && num <= 120, 'Age must be between 13 and 120')
        .optional(), // Optional age filter
      
      // Sorting
      sortBy: z.enum(['name', 'email', 'age', 'createdAt']) // Allowed sort fields
        .default('createdAt')
        .optional(),
      
      sortOrder: z.enum(['asc', 'desc']) // Allowed sort orders
        .default('desc')
        .optional(),
      
      // Search
      search: z.string() // Search term
        .min(1, 'Search term must be at least 1 character')
        .max(50, 'Search term cannot exceed 50 characters')
        .trim()
        .optional()
    })
  });

// Export the inferred types for use in controllers. z.infer extracts TypeScript types from Zod schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserParamsInput = z.infer<typeof userParamsSchema>;
export type GetUsersInput = z.infer<typeof getUsersSchema>;
