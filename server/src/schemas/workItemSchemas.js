import { z } from 'zod';
export const createWorkItemSchema = z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().min(5, 'Description must be at least 5 characters').max(5000),
    type: z.enum([
        'CUSTOMER_ISSUE',
        'ENGINEERING_PROBLEM',
        'PAYMENT_INVESTIGATION',
        'PRODUCTION_INCIDENT',
        'COMPLIANCE_REQUEST',
        'OPERATIONAL_TASK',
    ]),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team ID format'),
    assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID format').nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    requiresApproval: z.boolean().default(false),
});
export const updateWorkItemSchema = z.object({
    version: z.number().int().positive('Version is required for concurrency control'),
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(5).max(5000).optional(),
    type: z
        .enum([
        'CUSTOMER_ISSUE',
        'ENGINEERING_PROBLEM',
        'PAYMENT_INVESTIGATION',
        'PRODUCTION_INCIDENT',
        'COMPLIANCE_REQUEST',
        'OPERATIONAL_TASK',
    ])
        .optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
});
export const assignWorkItemSchema = z.object({
    version: z.number().int().positive('Version is required for concurrency control'),
    assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID format').nullable(),
});
export const claimWorkItemSchema = z.object({
    version: z.number().int().positive().optional(),
});
export const transitionWorkItemSchema = z.object({
    version: z.number().int().positive('Version is required for concurrency control'),
    targetStatus: z.enum(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED']).optional(),
    approvalAction: z.enum(['APPROVE', 'REJECT']).optional(),
    reason: z.string().trim().max(1000).optional(),
}).refine((data) => data.targetStatus || data.approvalAction, {
    message: 'Either targetStatus or approvalAction must be provided',
});
export const commentWorkItemSchema = z.object({
    body: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});
export const queryWorkItemSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    type: z
        .enum([
        'CUSTOMER_ISSUE',
        'ENGINEERING_PROBLEM',
        'PAYMENT_INVESTIGATION',
        'PRODUCTION_INCIDENT',
        'COMPLIANCE_REQUEST',
        'OPERATIONAL_TASK',
    ])
        .optional(),
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    overdue: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'dueDate', 'identifier', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    myWork: z.enum(['assigned', 'created', 'urgent', 'overdue', 'awaiting_approval']).optional(),
});
