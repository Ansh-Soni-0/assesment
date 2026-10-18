import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    globalRole: {
        type: String,
        enum: ['ADMIN', 'OPERATOR', 'MEMBER'],
        default: 'MEMBER',
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.passwordHash;
            return ret;
        },
    },
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
