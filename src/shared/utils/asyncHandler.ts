/**
 * Async Handler Utility
 * 
 * This utility wraps async functions to automatically catch errors
 * and pass them to Express error handling middleware. Without this,
 * you'd need try/catch blocks in every async route handler.
 */


import type { Request, Response, NextFunction } from 'express';

// Type definition for async route handlers
interface AsyncHandler {
    (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any>;
}


/**
 * Wraps an async function to catch errors and pass them to Express error handler
 * Works with both async and sync functions
 * Usage:
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find(); // If this throws, asyncHandler catches it
 *   res.json(users);
 * }));
 */

const asyncHandler = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}



/**
 * Alternative syntax using a higher-order function approach
 * More direct specifically for async functions
 * Some developers prefer this syntax
 */

export { asyncHandler };