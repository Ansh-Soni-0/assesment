import mongoose, { Schema } from 'mongoose';
const IdempotencyRecordSchema = new Schema({
    key: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    requestFingerprint: {
        type: String,
        required: true,
    },
    resourceId: {
        type: String,
        default: null,
    },
    responseStatus: {
        type: Number,
        required: true,
    },
    responseBody: {
        type: Schema.Types.Mixed,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
        index: { expires: 0 },
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
// Compound unique index ensuring each user can use a key once within TTL window
IdempotencyRecordSchema.index({ key: 1, userId: 1 }, { unique: true });
export const IdempotencyRecord = mongoose.models.IdempotencyRecord ||
    mongoose.model('IdempotencyRecord', IdempotencyRecordSchema);
