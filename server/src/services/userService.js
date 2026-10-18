import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { AppError } from '../utils/errors.js';
export class UserService {
    static async getUsers(query) {
        const filter = {};
        if (query.role) {
            filter.globalRole = query.role;
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === 'true';
        }
        if (query.search && query.search.trim()) {
            const searchRegex = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ name: searchRegex }, { email: searchRegex }];
        }
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    static async getUserById(id) {
        const user = await User.findById(id).lean();
        if (!user) {
            throw AppError.notFound('User', id);
        }
        const memberships = await TeamMembership.find({ userId: id })
            .populate('teamId', 'name description')
            .lean();
        return { ...user, memberships };
    }
    static async createUser(data) {
        const existing = await User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw AppError.conflict('A user with this email address already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const user = new User({
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            globalRole: data.globalRole || 'MEMBER',
            isActive: data.isActive !== undefined ? data.isActive : true,
        });
        await user.save();
        return user;
    }
    static async updateUser(id, data) {
        const user = await User.findById(id);
        if (!user) {
            throw AppError.notFound('User', id);
        }
        if (data.email && data.email.toLowerCase() !== user.email) {
            const existing = await User.findOne({ email: data.email.toLowerCase() });
            if (existing) {
                throw AppError.conflict('A user with this email address already exists');
            }
            user.email = data.email.toLowerCase();
        }
        if (data.name)
            user.name = data.name;
        if (data.globalRole)
            user.globalRole = data.globalRole;
        if (data.isActive !== undefined)
            user.isActive = data.isActive;
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(data.password, salt);
        }
        await user.save();
        return user;
    }
}
