import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
export const connectDB = async (customUri) => {
    const uri = customUri || env.MONGODB_URI;
    try {
        const conn = await mongoose.connect(uri, {
            autoIndex: true,
        });
        logger.info('MongoDB connected successfully', { host: conn.connection.host, name: conn.connection.name });
        return conn;
    }
    catch (error) {
        logger.error('MongoDB connection failed', { error: error.message });
        throw error;
    }
};
export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
    }
    catch (error) {
        logger.error('Error disconnecting MongoDB', { error: error.message });
    }
};
