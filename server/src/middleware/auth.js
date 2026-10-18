import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
export const authenticate = async (req, _res, next) => {
    try {
        let token;
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            // Check HTTP-only cookie
            token = req.cookies.token;
        }
        if (!token) {
            throw AppError.unauthorized('Authentication required. No token provided.');
        }
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('+passwordHash');
        if (!user) {
            throw AppError.unauthorized('User account no longer exists');
        }
        if (!user.isActive) {
            throw AppError.unauthorized('This user account has been deactivated');
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            globalRole: user.globalRole,
            isActive: user.isActive,
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(AppError.unauthorized('Invalid or expired authentication token'));
        }
        else {
            next(error);
        }
    }
};
