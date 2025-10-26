/**
 * User Service
 * 
 * This file contains all business logic related to user operations.
 * It handles database interactions, data processing, and business rules.
 */

import { User, type UserDocument } from './user.model.js';
import type { IUser, CreateUserData, UpdateUserData, UserQueryParams } from './user.types.js';
import type { PaginatedResponse } from '../../shared/types/api.types.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { logger } from '../../shared/config/logger.js';

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<IUser> => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError('Email already registered', 409);
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    logger.info(`New user created: ${user.email}`);
    
    // Return user without password using toJSON (transforms _id to id and removes password)
    return user.toJSON() as IUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error creating user: ${error}`);
    throw new ApiError('Failed to create user', 500);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<IUser> => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return user.toJSON() as IUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error fetching user by ID: ${error}`);
    throw new ApiError('Failed to fetch user', 500);
  }
};

/**
 * Get user by email (used for authentication)
 */
export const getUserByEmail = async (email: string, includePassword = false): Promise<UserDocument | null> => {
  try {
    const query = User.findOne({ email: email.toLowerCase() });
    
    if (includePassword) {
      query.select('+password');
    }
    
    return await query;
  } catch (error) {
    logger.error(`Error fetching user by email: ${error}`);
    throw new ApiError('Failed to fetch user', 500);
  }
};

/**
 * Get all users with filtering and pagination
 */
export const getUsers = async (queryParams: UserQueryParams): Promise<PaginatedResponse<IUser>> => {
  try {
    const { page = 1, limit = 10, age, sortBy = 'createdAt', sortOrder = 'desc', search } = queryParams;

    // Build filter object
    const filter: any = {};
    
    if (age) {
      filter.age = age;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance when we don't need Mongoose documents
      User.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.debug(`Retrieved ${users.length} users (page ${page}/${totalPages})`);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        age: user.age,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })) as IUser[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error fetching users: ${error}`);
    throw new ApiError('Failed to fetch users', 500);
  }
};

/**
 * Update user information
 */
export const updateUser = async (userId: string, updateData: UpdateUserData): Promise<IUser> => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData }, // Use $set to only update provided fields
      { new: true, runValidators: true } // Return the updated document
    );

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    logger.info(`User updated: ${user.email}`);
    return user.toJSON() as IUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error updating user: ${error}`);
    throw new ApiError('Failed to update user', 500);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    logger.info(`User deleted: ${user.email}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Error deleting user: ${error}`);
    throw new ApiError('Failed to delete user', 500);
  }
};

