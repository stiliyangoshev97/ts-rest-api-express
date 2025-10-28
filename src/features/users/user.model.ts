/**
 * User Mongoose Model - DATABASE VALIDATION LAYER
 * 
 * PURPOSE: Validates data integrity before saving to MongoDB database
 * WHEN: Runs at the database layer before MongoDB save/update operations
 * VALIDATES: Final data going into database, regardless of entry point
 * CATCHES: Data corruption, bypassed API calls, direct service operations
 * 
 * This file defines the MongoDB schema and model for users using Mongoose.
 * It includes essential validation, middleware for password hashing, indexes
 * for performance, and useful methods like comparePassword.
 * 
 * NOTE: These validations should match the input schema validations
 * in user.schemas.ts to maintain consistency across validation layers.
 */

import mongoose, { Document, Schema } from 'mongoose';
import { hashPassword } from '../../shared/utils/password.js';
import type { IUser } from './user.types.js';

// Extend the IUser interface for Mongoose document
export interface UserDocument extends Omit<IUser, 'id'>, Document {
    password: string;  // Ensure password is available on the document for methods
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
  }

// Define the User schema - essential database constraints only (business logic validation in user.schemas.ts)
const userSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: true,    // Essential: field is mandatory
        trim: true,        // Data normalization: remove whitespace
        index: true        // Performance: optimize name queries
    },
    email: {
        type: String,
        required: true,    // Essential: field is mandatory
        unique: true,      // Database constraint: prevent duplicates (automatically creates index)
        trim: true,        // Data normalization: remove whitespace
        lowercase: true,   // Data normalization: consistent format
    },
    password: {
        type: String,
        required: true,    // Essential: field is mandatory
        select: false      // Security: exclude from query results by default
    },
    age: {
        type: Number,
        required: true     // Essential: field is mandatory
    },
    passwordResetToken: {
        type: String,
        select: false      // Security: exclude from query results by default
    },
    passwordResetExpires: {
        type: Date,
        select: false      // Security: exclude from query results by default
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: {
        virtuals: true, // Include virtuals when converting to JSON
        transform: function(doc, ret) {
            delete (ret as any)._id; // Remove _id field
            delete (ret as any).__v; // Remove __v field
            delete (ret as any).password; // User never expose password
            return ret;
        }
    }
})


// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const { comparePassword } = await import('../../shared/utils/password.js');
  return comparePassword(candidatePassword, this.password);
};

// Export the model
export const User = mongoose.model<UserDocument>('User', userSchema);