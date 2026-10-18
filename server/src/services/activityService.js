import { Activity } from '../models/Activity.js';
import { logger } from '../utils/logger.js';
export const recordActivity = async (params) => {
    try {
        const activity = new Activity({
            workItemId: params.workItemId,
            actorId: params.actorId,
            action: params.action,
            fieldChanged: params.fieldChanged || null,
            oldValue: params.oldValue !== undefined ? params.oldValue : null,
            newValue: params.newValue !== undefined ? params.newValue : null,
            metadata: params.metadata || {},
        });
        if (params.session) {
            await activity.save({ session: params.session });
        }
        else {
            await activity.save();
        }
        return activity;
    }
    catch (error) {
        logger.error('Failed to record activity log', { error: error.message, params });
        throw error;
    }
};
export const getActivitiesForWorkItem = async (workItemId) => {
    return Activity.find({ workItemId })
        .populate('actorId', 'name email globalRole')
        .sort({ createdAt: -1 })
        .lean();
};
