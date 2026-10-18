export class AppError extends Error {
    statusCode;
    code;
    details;
    isOperational;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, details) {
        return new AppError(400, 'BAD_REQUEST', message, details);
    }
    static unauthorized(message = 'Authentication required') {
        return new AppError(401, 'UNAUTHORIZED', message);
    }
    static forbidden(message = 'You do not have permission to perform this action') {
        return new AppError(403, 'FORBIDDEN', message);
    }
    static notFound(resource = 'Resource', id) {
        return new AppError(404, 'NOT_FOUND', id ? `${resource} with id '${id}' not found` : `${resource} not found`);
    }
    static conflict(message, details) {
        return new AppError(409, 'CONFLICT', message, details);
    }
    static unprocessable(message, details) {
        return new AppError(422, 'UNPROCESSABLE_ENTITY', message, details);
    }
    static internal(message = 'An unexpected internal error occurred') {
        return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
    }
}
