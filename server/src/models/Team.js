import mongoose, { Schema } from 'mongoose';
const TeamSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: 500,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
