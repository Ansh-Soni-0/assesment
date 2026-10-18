import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
export const validateBody = (schema) => {
    return async (req, _res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const issues = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request body', issues));
            }
            else {
                next(error);
            }
        }
    };
};
export const validateQuery = (schema) => {
    return async (req, _res, next) => {
        try {
            req.query = (await schema.parseAsync(req.query));
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const issues = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', issues));
            }
            else {
                next(error);
            }
        }
    };
};
export const validateParams = (schema) => {
    return async (req, _res, next) => {
        try {
            req.params = (await schema.parseAsync(req.params));
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const issues = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new AppError(400, 'VALIDATION_ERROR', 'Invalid route parameters', issues));
            }
            else {
                next(error);
            }
        }
    };
};
