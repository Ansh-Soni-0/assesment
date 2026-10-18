import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, } from '../services/notificationService.js';
export const getNotifications = async (req, res, next) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const result = await getUserNotifications(req.user.id, limit);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await markNotificationAsRead(req.params.id, req.user.id);
        res.json({ success: true, data: notification });
    }
    catch (error) {
        next(error);
    }
};
export const markAllAsRead = async (req, res, next) => {
    try {
        await markAllNotificationsAsRead(req.user.id);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
};
