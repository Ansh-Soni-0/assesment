import { Notification } from '../models/Notification.js';
import { logger } from '../utils/logger.js';
export const createNotification = async (params) => {
    try {
        // Avoid notifying oneself
        if (params.recipientId.toString() === params.actorId.toString()) {
            return null;
        }
        const notification = await Notification.create({
            recipientId: params.recipientId,
            actorId: params.actorId,
            type: params.type,
            title: params.title,
            message: params.message,
            workItemId: params.workItemId || null,
        });
        return notification;
    }
    catch (error) {
        logger.error('Failed to create notification', { error: error.message });
        return null;
    }
};
export const getUserNotifications = async (userId, limit = 20) => {
    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ recipientId: userId })
            .populate('actorId', 'name email')
            .populate('workItemId', 'identifier title')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        Notification.countDocuments({ recipientId: userId, read: false }),
    ]);
    return { notifications, unreadCount };
};
export const markNotificationAsRead = async (notificationId, userId) => {
    return Notification.findOneAndUpdate({ _id: notificationId, recipientId: userId }, { $set: { read: true } }, { new: true });
};
export const markAllNotificationsAsRead = async (userId) => {
    return Notification.updateMany({ recipientId: userId, read: false }, { $set: { read: true } });
};
