import { WorkItem } from '../models/WorkItem.js';
import { Activity } from '../models/Activity.js';
import { TeamMembership } from '../models/TeamMembership.js';
export class DashboardService {
    static async getDashboardMetrics(user) {
        const filter = {};
        // Filter by user's teams if not admin/operator
        if (user.globalRole !== 'ADMIN' && user.globalRole !== 'OPERATOR') {
            const userTeams = await TeamMembership.find({ userId: user.id }).distinct('teamId');
            filter.$or = [
                { teamId: { $in: userTeams } },
                { assigneeId: user.id },
                { createdBy: user.id },
            ];
        }
        const now = new Date();
        const [totalOpen, assignedToMe, highUrgent, overdue, awaitingApproval, statusBreakdown, priorityBreakdown, typeBreakdown, recentItems,] = await Promise.all([
            // Total open work items (OPEN, IN_PROGRESS, BLOCKED)
            WorkItem.countDocuments({ ...filter, status: { $in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] } }),
            // Items assigned to current employee
            WorkItem.countDocuments({ assigneeId: user.id, status: { $nin: ['CLOSED'] } }),
            // High or urgent priority items
            WorkItem.countDocuments({
                ...filter,
                priority: { $in: ['HIGH', 'URGENT'] },
                status: { $nin: ['RESOLVED', 'CLOSED'] },
            }),
            // Overdue items
            WorkItem.countDocuments({
                ...filter,
                dueDate: { $lt: now },
                status: { $nin: ['RESOLVED', 'CLOSED'] },
            }),
            // Items awaiting approval
            WorkItem.countDocuments({
                ...filter,
                requiresApproval: true,
                approvalStatus: 'PENDING',
            }),
            // Grouped by status
            WorkItem.aggregate([
                { $match: filter },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            // Grouped by priority
            WorkItem.aggregate([
                { $match: filter },
                { $group: { _id: '$priority', count: { $sum: 1 } } },
            ]),
            // Grouped by type
            WorkItem.aggregate([
                { $match: filter },
                { $group: { _id: '$type', count: { $sum: 1 } } },
            ]),
            // Recently updated items (top 5)
            WorkItem.find(filter)
                .populate('teamId', 'name')
                .populate('assigneeId', 'name email')
                .sort({ updatedAt: -1 })
                .limit(5)
                .lean(),
        ]);
        // Format breakdown arrays to key-value objects
        const statusCounts = {
            OPEN: 0,
            IN_PROGRESS: 0,
            BLOCKED: 0,
            RESOLVED: 0,
            CLOSED: 0,
        };
        for (const s of statusBreakdown) {
            if (s._id)
                statusCounts[s._id] = s.count;
        }
        const priorityCounts = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0,
        };
        for (const p of priorityBreakdown) {
            if (p._id)
                priorityCounts[p._id] = p.count;
        }
        // Recent activity logs
        const itemIds = await WorkItem.find(filter).select('_id').limit(100);
        const recentActivities = await Activity.find({
            workItemId: { $in: itemIds.map((i) => i._id) },
        })
            .populate('actorId', 'name email')
            .populate('workItemId', 'identifier title')
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();
        return {
            metrics: {
                totalOpen,
                assignedToMe,
                highUrgent,
                overdue,
                awaitingApproval,
            },
            breakdowns: {
                status: statusCounts,
                priority: priorityCounts,
                type: typeBreakdown.map((t) => ({ type: t._id, count: t.count })),
            },
            recentItems,
            recentActivities,
        };
    }
}
