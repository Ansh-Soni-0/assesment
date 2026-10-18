import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const generateToken = (id, email) => {
    return jwt.sign({ id, email }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw AppError.unauthorized('Invalid email or password');
        }
        if (!user.isActive) {
            throw AppError.unauthorized('This account has been deactivated. Please contact an administrator.');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw AppError.unauthorized('Invalid email or password');
        }
        const token = generateToken(user._id.toString(), user.email);
        setAuthCookie(res, token);
        const memberships = await TeamMembership.find({ userId: user._id })
            .populate('teamId', 'name description')
            .lean();
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    globalRole: user.globalRole,
                    isActive: user.isActive,
                    memberships,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const logout = (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
};
export const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw AppError.unauthorized();
        }
        const user = await User.findById(req.user.id);
        if (!user || !user.isActive) {
            throw AppError.unauthorized('User not found or deactivated');
        }
        const memberships = await TeamMembership.find({ userId: user._id })
            .populate('teamId', 'name description')
            .lean();
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    globalRole: user.globalRole,
                    isActive: user.isActive,
                    memberships,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            throw AppError.unauthorized();
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            throw AppError.notFound('User');
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw AppError.badRequest('Current password is incorrect');
        }
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
