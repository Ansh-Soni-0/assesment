import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
export const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal error occurred';
    let details = undefined;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        details = err.details;
    }
    else if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        code = 'INVALID_ID';
        message = `Invalid ID format for path '${err.path}'`;
    }
    else if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = 'Database validation failed';
        details = Object.values(err.errors).map((e) => ({
            path: e.path,
            message: e.message,
        }));
    }
    else if (err.code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_KEY';
        message = 'A resource with this unique identifier or field already exists';
        details = err.keyValue;
    }
    else {
        logger.error('Unhandled server exception', {
            error: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
        });
    }
    // Ensure security: never leak internal stack traces to clients
    res.status(statusCode).json({
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    });
};
