import mongoose, { Schema } from 'mongoose';
const TeamMembershipSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['LEAD', 'MEMBER'],
        default: 'MEMBER',
        required: true,
    },
}, {
    timestamps: true,
});
// Compound unique index on userId and teamId
TeamMembershipSchema.index({ userId: 1, teamId: 1 }, { unique: true });
export const TeamMembership = mongoose.models.TeamMembership || mongoose.model('TeamMembership', TeamMembershipSchema);
