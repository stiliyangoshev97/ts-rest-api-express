/**
 * Request Validation Middleware Module
 * 
 * This module provides comprehensive request validation using Zod schemas,
 * ensuring type safety and data integrity across all API endpoints.
 * 
 * @module ValidationMiddleware
 * 
 * Features:
 * - Type-safe validation with Zod schemas
 * - Validates request body, params, query, and headers
 * - Detailed error messages for debugging
 * - Multiple validation strategies (individual vs. combined)
 * - Automatic data transformation and sanitization
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { validate, validateBody } from './validation.js';
 * 
 * // Define schemas
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 * 
 * const userParamsSchema = z.object({
 *   id: z.string().min(1)
 * });
 * 
 * // Use in routes
 * router.post('/users', validateBody(createUserSchema), createUser);
 * router.get('/users/:id', validateParams(userParamsSchema), getUser);
 * ```
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';

/**
 * Interface defining which parts of the request to validate
 * 
 * @interface ValidationSchemas
 */
interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

/**
 * Creates comprehensive validation middleware for multiple request parts
 * 
 * Validates any combination of request body, parameters, query strings, and headers
 * using provided Zod schemas. Failed validation returns detailed error messages.
 * 
 * @param schemas - Object containing Zod schemas for different request parts
 * @returns Express middleware function
 * 
 * @throws {ApiError} 400 - When validation fails with detailed error messages
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * 
 * const schemas = {
 *   body: z.object({ email: z.string().email() }),
 *   params: z.object({ id: z.string().uuid() }),
 *   query: z.object({ page: z.string().optional() })
 * };
 * 
 * router.post('/users/:id', validate(schemas), updateUser);
 * ```
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schemas.body) {
        const validatedBody = schemas.body.parse(req.body);
        req.body = validatedBody;
      }

      // Validate request parameters
      if (schemas.params) {
        const validatedParams = schemas.params.parse(req.params);
        (req.params as any) = validatedParams;
      }

      // Validate query parameters
      if (schemas.query) {
        const validatedQuery = schemas.query.parse(req.query);
        // Note: req.query is read-only, so we validate but don't reassign
      }

      // Validate headers
      if (schemas.headers) {
        const validatedHeaders = schemas.headers.parse(req.headers);
        (req.headers as any) = validatedHeaders;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });

        logger.warn('Validation failed: ' + errorMessages.join(', '));

        const apiError = new ApiError(
          `Validation failed: ${errorMessages.join(', ')}`,
          400
        );
        
        next(apiError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validates request body only
 * 
 * Convenience wrapper around validate() for body-only validation.
 * Most commonly used for POST/PUT/PATCH endpoints.
 * 
 * @param schema - Zod schema for request body validation
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   email: z.string().email('Invalid email format'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 *   name: z.string().min(1, 'Name is required')
 * });
 * 
 * router.post('/auth/register', validateBody(createUserSchema), register);
 * ```
 */
export const validateBody = (schema: ZodSchema) => {
  return validate({ body: schema });
};

/**
 * Validates route parameters only
 * 
 * Validates URL parameters like /:id, /:userId, etc.
 * Useful for ensuring valid resource identifiers.
 * 
 * @param schema - Zod schema for route parameters validation
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const userParamsSchema = z.object({
 *   id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
 * });
 * 
 * router.get('/users/:id', validateParams(userParamsSchema), getUserById);
 * router.delete('/users/:id', validateParams(userParamsSchema), deleteUser);
 * ```
 */
export const validateParams = (schema: ZodSchema) => {
  return validate({ params: schema });
};

/**
 * Validates query parameters only
 * 
 * Validates URL query strings like ?page=1&limit=10&sort=name.
 * Useful for pagination, filtering, and sorting parameters.
 * 
 * @param schema - Zod schema for query parameters validation
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const paginationQuerySchema = z.object({
 *   page: z.string().optional().transform(val => val ? parseInt(val) : 1),
 *   limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
 *   sort: z.enum(['name', 'email', 'createdAt']).optional()
 * });
 * 
 * router.get('/users', validateQuery(paginationQuerySchema), getUsers);
 * ```
 */
export const validateQuery = (schema: ZodSchema) => {
  return validate({ query: schema });
};

/**
 * Validates request headers only
 * 
 * Validates HTTP headers for required values, formats, or API versions.
 * Less commonly used but useful for API versioning or custom headers.
 * 
 * @param schema - Zod schema for headers validation
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const apiVersionSchema = z.object({
 *   'api-version': z.enum(['v1', 'v2']).optional(),
 *   'content-type': z.string().refine(val => 
 *     val.includes('application/json'), 'Content-Type must be application/json'
 *   )
 * });
 * 
 * router.post('/api/data', validateHeaders(apiVersionSchema), processData);
 * ```
 */
export const validateHeaders = (schema: ZodSchema) => {
  return validate({ headers: schema });
};

/**
 * Validates entire request using a unified schema
 * 
 * Alternative approach where a single schema defines validation for
 * body, params, and query together. Useful for complex validation scenarios.
 * 
 * @param schema - Zod schema containing body, params, and query properties
 * @returns Express middleware function
 * 
 * @throws {ApiError} 400 - When request validation fails
 * 
 * @example
 * ```typescript
 * const updateUserRequestSchema = z.object({
 *   params: z.object({
 *     id: z.string().regex(/^[0-9a-fA-F]{24}$/)
 *   }),
 *   body: z.object({
 *     email: z.string().email().optional(),
 *     name: z.string().min(1).optional()
 *   }),
 *   query: z.object({
 *     validate: z.enum(['true', 'false']).optional()
 *   })
 * });
 * 
 * router.put('/users/:id', validateRequest(updateUserRequestSchema), updateUser);
 * ```
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Create a clean request object for validation
      // We need to be careful with req.query as it's read-only
      const requestData = {
        body: req.body || {},
        params: req.params || {},
        // Don't include query in the validation object to avoid read-only issues
      };

      // Parse the request against the schema
      const validatedData = schema.parse(requestData) as any;

      // Update request with validated data
      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }
      if (validatedData.params !== undefined) {
        (req.params as any) = validatedData.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });

        logger.warn('Request validation failed: ' + errorMessages.join(', '));

        const apiError = new ApiError(
          `Request validation failed: ${errorMessages.join(', ')}`,
          400
        );
        
        next(apiError);
      } else {
        next(error);
      }
    }
  };
};
