import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['ASSIGNMENT', 'PRIORITY_ESCALATION', 'APPROVAL_REQUIRED', 'STATUS_CHANGE', 'COMMENT_ADDED'],
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    workItemId: {
        type: Schema.Types.ObjectId,
        ref: 'WorkItem',
        default: null,
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
});
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
