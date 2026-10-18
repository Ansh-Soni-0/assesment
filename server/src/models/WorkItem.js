import mongoose, { Schema } from 'mongoose';
const WorkItemSchema = new Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    type: {
        type: String,
        enum: [
            'CUSTOMER_ISSUE',
            'ENGINEERING_PROBLEM',
            'PAYMENT_INVESTIGATION',
            'PRODUCTION_INCIDENT',
            'COMPLIANCE_REQUEST',
            'OPERATIONAL_TASK',
        ],
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED'],
        default: 'OPEN',
        index: true,
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
        index: true,
    },
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true,
    },
    assigneeId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    dueDate: {
        type: Date,
        default: null,
        index: true,
    },
    requiresApproval: {
        type: Boolean,
        default: false,
        index: true,
    },
    approvalStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NONE',
        index: true,
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    approvedAt: {
        type: Date,
        default: null,
    },
    resolvedAt: {
        type: Date,
        default: null,
    },
    closedAt: {
        type: Date,
        default: null,
    },
    version: {
        type: Number,
        default: 1,
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes for common queries and sorting
WorkItemSchema.index({ teamId: 1, status: 1 });
WorkItemSchema.index({ assigneeId: 1, status: 1 });
WorkItemSchema.index({ createdAt: -1 });
WorkItemSchema.index({ title: 'text', description: 'text', identifier: 'text' });
export const WorkItem = mongoose.models.WorkItem || mongoose.model('WorkItem', WorkItemSchema);
