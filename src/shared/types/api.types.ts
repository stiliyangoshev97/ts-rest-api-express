/**
 * Generic API Response Types
 * 
 * This file contains reusable API response structures that are used
 * across different features and endpoints for consistent responses.
 */

/**
 * Standard API response format - for consistent responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;             // This changes based on T which can be any type
  error?: string;
}

/**
 * Paginated response - for endpoints that return lists
 */
export interface PaginatedResponse<T> extends ApiResponse {
  pagination: {
    page: number;       // Current page number
    limit: number;      // Items per page
    total: number;      // Total number of items
    totalPages: number; // Total number of pages
    hasNext: boolean;   // Is there a next page
    hasPrev: boolean;   // Is there a previous page
  };
}

/**
 * Error response format - for consistent error handling
 */
export interface ErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
  stack?: string;       // Only in development
}

/**
 * Validation error details - for Zod validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Rate limiting info - returned in rate limit responses
 */
export interface RateLimitInfo {
  limit: number;        // Max requests allowed
  remaining: number;    // Requests remaining
  reset: Date;          // When limit resets
}
