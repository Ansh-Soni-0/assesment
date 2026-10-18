import { z } from 'zod';
export const createUserSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    globalRole: z.enum(['ADMIN', 'OPERATOR', 'MEMBER']).default('MEMBER'),
    isActive: z.boolean().default(true),
});
export const updateUserSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    globalRole: z.enum(['ADMIN', 'OPERATOR', 'MEMBER']).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});
