import mongoose, { Schema } from 'mongoose';
const CounterSchema = new Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 1000 },
});
export const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
export async function getNextWorkItemId(session) {
    const options = { new: true, upsert: true, setDefaultsOnInsert: true, session };
    const counter = await Counter.findOneAndUpdate({ name: 'workItemId' }, { $inc: { seq: 1 } }, options);
    return `NW-${counter.seq}`;
}
