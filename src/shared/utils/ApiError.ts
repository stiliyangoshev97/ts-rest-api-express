/**
 * Custom API Error Class
 * 
 * This class extends the built-in Error class to provide more structured
 * error handling for our API. It includes HTTP status codes and helps
 * distinguish between operational errors (expected) and programming errors.
 */

class ApiError extends Error {
    public statusCode: number; // HTTP status code (400, 401, 404, etc...)
    public isOperational: boolean; // True for expected errors, false for bugs

    constructor(
        message: string, // Error message to show to user
        statusCode: number, // HTTP status code
        isOperational: boolean = true // Whether this is an expected error
    ) {
        super(message); // Call parent constructor

        this.statusCode = statusCode;
        this.isOperational = isOperational

        // Maintain proper stack trace (only in V8 engines)
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * HTTP 400 Bad Request Error
 * 
 * Use this when the client's request is malformed or contains invalid data.
 * 
 * @example
 * ```typescript
 * // In a controller when validation fails
 * if (!email || !password) {
 *   throw new BadRequestError('Email and password are required');
 * }
 * ```
 */
class BadRequestError extends ApiError {
    /**
     * Creates a new Bad Request error
     * @param message - Error message (defaults to 'Bad Request')
     */
    constructor(message: string = 'Bad Request') {
        super(message, 400);
    }
}

/**
 * HTTP 401 Unauthorized Error
 * 
 * Use this when authentication is required but not provided or invalid.
 * 
 * @example
 * ```typescript
 * // In auth middleware when JWT is invalid
 * if (!token || !isValidToken(token)) {
 *   throw new UnauthorizedError('Invalid or missing authentication token');
 * }
 * ```
 */
class UnauthorizedError extends ApiError {
    /**
     * Creates a new Unauthorized error
     * @param message - Error message (defaults to 'Unauthorized')
     */
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * HTTP 403 Forbidden Error
 * 
 * Use this when the user is authenticated but doesn't have permission.
 * 
 * @example
 * ```typescript
 * // In authorization middleware
 * if (user.role !== 'admin') {
 *   throw new ForbiddenError('Admin access required');
 * }
 * ```
 */
class ForbiddenError extends ApiError {
    /**
     * Creates a new Forbidden error
     * @param message - Error message (defaults to 'Forbidden')
     */
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

/**
 * HTTP 404 Not Found Error
 * 
 * Use this when a requested resource doesn't exist.
 * 
 * @example
 * ```typescript
 * // In a service when finding a user by ID
 * const user = await User.findById(id);
 * if (!user) {
 *   throw new NotFoundError(`User with ID ${id} not found`);
 * }
 * ```
 */
class NotFoundError extends ApiError {
    /**
     * Creates a new Not Found error
     * @param message - Error message (defaults to 'Not Found')
     */
    constructor(message: string = 'Not Found') {
        super(message, 404);
    }
}

/**
 * HTTP 409 Conflict Error
 * 
 * Use this when there's a conflict with the current state (e.g., duplicate resources).
 * 
 * @example
 * ```typescript
 * // In user registration when email already exists
 * const existingUser = await User.findOne({ email });
 * if (existingUser) {
 *   throw new ConflictError('User with this email already exists');
 * }
 * ```
 */
class ConflictError extends ApiError {
    /**
     * Creates a new Conflict error
     * @param message - Error message (defaults to 'Conflict')
     */
    constructor(message: string = 'Conflict') {
        super(message, 409);
    }
}

/**
 * HTTP 500 Internal Server Error
 * 
 * Use this for unexpected server errors that are not operational.
 * These are usually programming errors or system failures.
 * 
 * @example
 * ```typescript
 * // In a try-catch block for unexpected errors
 * try {
 *   await someComplexOperation();
 * } catch (error) {
 *   throw new InternalServerError('An unexpected error occurred');
 * }
 * ```
 */
class InternalServerError extends ApiError {
    /**
     * Creates a new Internal Server error
     * @param message - Error message (defaults to 'Internal Server Error')
     */
    constructor(message: string = 'Internal Server Error') {
        super(message, 500, false); // Mark as non-operational
    }
}

export {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError
}