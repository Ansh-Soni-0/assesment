import mongoose, { Schema } from 'mongoose';
const ActivitySchema = new Schema({
    workItemId: {
        type: Schema.Types.ObjectId,
        ref: 'WorkItem',
        required: true,
        index: true,
    },
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATED',
            'ASSIGNED',
            'CLAIMED',
            'UNASSIGNED',
            'STATUS_CHANGED',
            'PRIORITY_CHANGED',
            'APPROVAL_REQUESTED',
            'APPROVED',
            'REJECTED',
            'COMMENT_ADDED',
            'UPDATED',
        ],
        index: true,
    },
    fieldChanged: {
        type: String,
        default: null,
    },
    oldValue: {
        type: Schema.Types.Mixed,
        default: null,
    },
    newValue: {
        type: Schema.Types.Mixed,
        default: null,
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // append-only
});
ActivitySchema.index({ workItemId: 1, createdAt: -1 });
export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
