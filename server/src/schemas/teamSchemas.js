import { z } from 'zod';
export const createTeamSchema = z.object({
    name: z.string().trim().min(2, 'Team name must be at least 2 characters').max(100),
    description: z.string().trim().max(500).default(''),
});
export const updateTeamSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
});
export const addMemberSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
    role: z.enum(['LEAD', 'MEMBER']).default('MEMBER'),
});
export const updateMemberSchema = z.object({
    role: z.enum(['LEAD', 'MEMBER']),
});
