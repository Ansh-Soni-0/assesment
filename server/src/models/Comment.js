import mongoose, { Schema } from 'mongoose';
const CommentSchema = new Schema({
    workItemId: {
        type: Schema.Types.ObjectId,
        ref: 'WorkItem',
        required: true,
        index: true,
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    body: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 2000,
    },
}, {
    timestamps: true,
});
CommentSchema.index({ workItemId: 1, createdAt: 1 });
export const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
