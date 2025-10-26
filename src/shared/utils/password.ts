/**
 * Password Utilities
 * 
 * This file contains utilities for securely handling passwords using bcrypt.
 * Bcrypt is a slow hashing function designed to be computationally expensive,
 * making it resistant to brute-force attacks.
 */

import bcrypt from 'bcrypt';
import { env } from '../config/env.js'; // Import environment variables
import { logger } from '../config/logger.js'; // Import logger

/**
 * Hash a plain text password using bcrypt
 * 
 * Uses bcrypt with configurable salt rounds from environment variables.
 * Higher rounds = more secure but slower processing.
 * 
 * @param password - The plain text password to hash
 * @returns Promise<string> - The securely hashed password
 * @throws {Error} When password hashing fails
 * 
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('myPassword123');
 * console.log(hashedPassword); // $2b$12$...
 * ```
 */
const hashPassword = async (password: string): Promise<string> => {
    try {
        // Generate a salt and hash the password
        // env.BCRYPT_ROUND determines how many rounds (higher = more secure but slower)
        const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUND);

        logger.debug('Password hashed successfully');
        return hashedPassword;
    } catch (error) {
        logger.error(`Error hashing password: ${String(error)}`);
        throw new Error('Password hashing failed');
    }
};

/**
 * Compare a plain text password with a hashed password
 * 
 * Uses bcrypt's built-in comparison that handles salt extraction automatically.
 * This is the secure way to verify passwords during login.
 * 
 * @param password - The plain text password to check
 * @param hashedPassword - The hashed password from database
 * @returns Promise<boolean> - True if passwords match, false otherwise
 * @throws {Error} When password comparison fails
 * 
 * @example
 * ```typescript
 * const isValid = await comparePassword('myPassword123', hashedFromDB);
 * if (isValid) {
 *   console.log('Password is correct');
 * }
 * ```
 */
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        // bcrypt.compare handles the salt automatically
        const isMatch = await bcrypt.compare(password, hashedPassword);
        logger.debug(`Password comparison result: ${isMatch ? 'match' : 'no match'}`);
        return isMatch;
    } catch (error) {
        logger.error(`Error comparing passwords: ${String(error)}`);
        throw new Error('Password comparison failed');
    }
};

/**
 * Validate password strength (optional utility)
 * 
 * @param password - The password to validate
 * @returns object with validation result and messages
 */

const validatePasswordStrenght = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check minimum length (already enforced by Zod, but good to have here too)
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Check for at least one number (optional - you can enable this)
  // if (!/\d/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }
  
  // Check for at least one uppercase letter (optional)
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  
  // Check for at least one lowercase letter (optional)
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  
  // Check for at least one special character (optional)
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }

  return {
    isValid: errors.length === 0,
    errors: errors
  }

}

export { hashPassword, comparePassword, validatePasswordStrenght };