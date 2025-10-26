/**
 * Database Connection Configuration
 * 
 * This file handles the connection to MongoDB using Mongoose.
 * It provides a function to connect to the database and handles
 * connection errors gracefully.
 */

import mongoose from "mongoose";
import { env } from './env.js'; // We use env.js and not env.ts because of ES module resolution
import { logger } from './logger.js'; // Import logger

/**
 * Connects to MongoDB database
 * If connection fails, the application will exit
 */

const connectDB = async (): Promise<void> => {
    try {
        // Connect to MongoDB using the URI from environment variables
        await mongoose.connect(env.MONGODB_URI);

        // Log successful connection
        logger.info('Connected to MongoDB database');

        // Optional: Log database name for configuration
        logger.info(`Connected to database: ${mongoose.connection.db?.databaseName}`);

    } catch (error) {
        // Log the error and exit the application
        logger.error(`MongoDB connection failed: ${String(error)}`);
        process.exit(1); // Exit with failure
    }
}

/**
 * Gracefully close database connection
 * Used when shutting down the application
 */

const disconnectDb = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB database');
    } catch (error) {
        logger.error(`Error disconnecting from MongoDB: ${String(error)}`);
    }
}

export { connectDB, disconnectDb };