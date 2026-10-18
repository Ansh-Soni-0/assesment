import { WorkItem } from '../models/WorkItem.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { Comment } from '../models/Comment.js';
import { getNextWorkItemId } from '../models/Counter.js';
import { AppError } from '../utils/errors.js';
import { getUserTeamMembership } from '../middleware/rbac.js';
import { recordActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
import { WorkflowService } from './workflowService.js';
export class WorkItemService {
    /**
     * Helper: verify user has access to view/interact with team's work
     */
    static async verifyTeamAccess(user, teamId) {
        if (user.globalRole === 'ADMIN' || user.globalRole === 'OPERATOR') {
            return { isLead: true };
        }
        const { isMember, role } = await getUserTeamMembership(user.id, teamId);
        if (!isMember) {
            throw AppError.forbidden('You do not have access to work items for this team');
        }
        return { isLead: role === 'LEAD' };
    }
    /**
     * Helper: verify that an assignee belongs to the designated team
     */
    static async verifyAssigneeEligibility(assigneeId, teamId) {
        const user = await User.findById(assigneeId);
        if (!user || !user.isActive) {
            throw AppError.badRequest('Assignee must be an active user');
        }
        const membership = await TeamMembership.findOne({ userId: assigneeId, teamId });
        if (!membership) {
            throw AppError.badRequest(`Assignee '${user.name}' does not belong to the selected team. Work items can only be assigned to eligible team members.`);
        }
    }
    /**
     * Create a new work item with atomic sequential identifier
     */
    static async createWorkItem(user, data) {
        const team = await Team.findById(data.teamId);
        if (!team) {
            throw AppError.notFound('Team', data.teamId);
        }
        await this.verifyTeamAccess(user, data.teamId);
        if (data.assigneeId) {
            await this.verifyAssigneeEligibility(data.assigneeId, data.teamId);
        }
        const identifier = await getNextWorkItemId();
        const workItem = new WorkItem({
            identifier,
            title: data.title,
            description: data.description,
            type: data.type,
            priority: data.priority || 'MEDIUM',
            status: 'OPEN',
            teamId: data.teamId,
            assigneeId: data.assigneeId || null,
            createdBy: user.id,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            requiresApproval: data.requiresApproval || false,
            approvalStatus: data.requiresApproval ? 'PENDING' : 'NONE',
            version: 1,
        });
        await workItem.save();
        // Record creation activity
        await recordActivity({
            workItemId: workItem._id,
            actorId: user.id,
            action: 'CREATED',
            newValue: {
                title: workItem.title,
                type: workItem.type,
                priority: workItem.priority,
                status: workItem.status,
            },
        });
        // Notify assignee if initially assigned
        if (data.assigneeId) {
            await recordActivity({
                workItemId: workItem._id,
                actorId: user.id,
                action: 'ASSIGNED',
                fieldChanged: 'assigneeId',
                newValue: data.assigneeId,
            });
            await createNotification({
                recipientId: data.assigneeId,
                actorId: user.id,
                type: 'ASSIGNMENT',
                title: 'New Work Item Assigned',
                message: `${user.name} assigned ${workItem.identifier} (${workItem.title}) to you`,
                workItemId: workItem._id,
            });
        }
        return workItem;
    }
    /**
     * Search, filter, sort and paginate work items on the server
     */
    static async getWorkItems(user, query) {
        const filter = {};
        // RBAC: Non-admin users are restricted to their teams' work unless looking at global public or their assignments
        if (user.globalRole !== 'ADMIN' && user.globalRole !== 'OPERATOR') {
            const userTeams = await TeamMembership.find({ userId: user.id }).distinct('teamId');
            filter.$or = [
                { teamId: { $in: userTeams } },
                { assigneeId: user.id },
                { createdBy: user.id },
            ];
        }
        // Explicit team filter
        if (query.teamId) {
            filter.teamId = query.teamId;
        }
        // Status filter
        if (query.status) {
            filter.status = query.status;
        }
        // Priority filter
        if (query.priority) {
            filter.priority = query.priority;
        }
        // Type filter
        if (query.type) {
            filter.type = query.type;
        }
        // Assignee filter
        if (query.assigneeId) {
            filter.assigneeId = query.assigneeId;
        }
        // Overdue filter
        if (query.overdue === 'true') {
            filter.dueDate = { $lt: new Date() };
            filter.status = { $nin: ['RESOLVED', 'CLOSED'] };
        }
        // My Work filter presets
        if (query.myWork) {
            switch (query.myWork) {
                case 'assigned':
                    filter.assigneeId = user.id;
                    filter.status = { $nin: ['CLOSED'] };
                    break;
                case 'created':
                    filter.createdBy = user.id;
                    break;
                case 'urgent':
                    filter.assigneeId = user.id;
                    filter.priority = { $in: ['URGENT', 'HIGH'] };
                    filter.status = { $nin: ['CLOSED'] };
                    break;
                case 'overdue':
                    filter.assigneeId = user.id;
                    filter.dueDate = { $lt: new Date() };
                    filter.status = { $nin: ['RESOLVED', 'CLOSED'] };
                    break;
                case 'awaiting_approval':
                    filter.requiresApproval = true;
                    filter.approvalStatus = 'PENDING';
                    break;
            }
        }
        // Search query across identifier, title, description (case-insensitive)
        if (query.search && query.search.trim()) {
            const term = query.search.trim();
            const searchRegex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { identifier: searchRegex },
                    { title: searchRegex },
                    { description: searchRegex },
                ],
            });
        }
        // Pagination
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        // Sorting allowlist
        const sortField = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
        const sortOptions = { [sortField]: sortOrder };
        const [items, total] = await Promise.all([
            WorkItem.find(filter)
                .populate('teamId', 'name')
                .populate('assigneeId', 'name email')
                .populate('createdBy', 'name email')
                .populate('approvedBy', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            WorkItem.countDocuments(filter),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    /**
     * Fetch single work item by ID with permission check
     */
    static async getWorkItemById(user, id) {
        const item = await WorkItem.findById(id)
            .populate('teamId', 'name description')
            .populate('assigneeId', 'name email globalRole')
            .populate('createdBy', 'name email globalRole')
            .populate('approvedBy', 'name email globalRole');
        if (!item) {
            throw AppError.notFound('WorkItem', id);
        }
        await this.verifyTeamAccess(user, item.teamId._id.toString());
        return item;
    }
    /**
     * Optimistic Concurrency Control (OCC) work item field update
     */
    static async updateWorkItem(user, id, data) {
        const item = await WorkItem.findById(id);
        if (!item) {
            throw AppError.notFound('WorkItem', id);
        }
        await this.verifyTeamAccess(user, item.teamId.toString());
        // Atomic update checking expected version
        const updateFields = {};
        if (data.title !== undefined)
            updateFields.title = data.title;
        if (data.description !== undefined)
            updateFields.description = data.description;
        if (data.type !== undefined)
            updateFields.type = data.type;
        if (data.priority !== undefined)
            updateFields.priority = data.priority;
        if (data.dueDate !== undefined)
            updateFields.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        const updated = await WorkItem.findOneAndUpdate({ _id: id, version: data.version }, { $set: updateFields, $inc: { version: 1 } }, { new: true })
            .populate('teamId', 'name')
            .populate('assigneeId', 'name email')
            .populate('createdBy', 'name email');
        if (!updated) {
            // Version mismatch: fetch fresh copy to report conflict
            const current = await WorkItem.findById(id);
            if (current) {
                throw AppError.conflict(`Conflict: This work item has already been updated by another user (expected version ${data.version}, current server version is ${current.version}). Please refresh the page to reconcile.`, { currentVersion: current.version });
            }
            throw AppError.notFound('WorkItem', id);
        }
        // Record activity for priority change
        if (data.priority && data.priority !== item.priority) {
            await recordActivity({
                workItemId: item._id,
                actorId: user.id,
                action: 'PRIORITY_CHANGED',
                fieldChanged: 'priority',
                oldValue: item.priority,
                newValue: data.priority,
            });
            // Notify assignee of escalation
            if (updated.assigneeId && (data.priority === 'HIGH' || data.priority === 'URGENT')) {
                await createNotification({
                    recipientId: updated.assigneeId._id,
                    actorId: user.id,
                    type: 'PRIORITY_ESCALATION',
                    title: `Priority Escalated to ${data.priority}`,
                    message: `${user.name} changed priority of ${updated.identifier} to ${data.priority}`,
                    workItemId: updated._id,
                });
            }
        }
        else {
            await recordActivity({
                workItemId: item._id,
                actorId: user.id,
                action: 'UPDATED',
                metadata: { updatedFields: Object.keys(updateFields) },
            });
        }
        return updated;
    }
    /**
     * Atomic concurrent task claiming:
     * Guarantees that only ONE user can claim an unassigned item.
     * Competing claimers will receive HTTP 409 Conflict.
     */
    static async claimWorkItem(user, id, version) {
        const item = await WorkItem.findById(id);
        if (!item) {
            throw AppError.notFound('WorkItem', id);
        }
        await this.verifyTeamAccess(user, item.teamId.toString());
        // Build atomic query condition: must be unassigned and not resolved/closed
        const condition = {
            _id: id,
            assigneeId: null,
            status: { $nin: ['RESOLVED', 'CLOSED'] },
        };
        if (version !== undefined) {
            condition.version = version;
        }
        const claimed = await WorkItem.findOneAndUpdate(condition, {
            $set: {
                assigneeId: user.id,
                status: item.status === 'OPEN' ? 'IN_PROGRESS' : item.status,
            },
            $inc: { version: 1 },
        }, { new: true })
            .populate('teamId', 'name')
            .populate('assigneeId', 'name email')
            .populate('createdBy', 'name email');
        if (!claimed) {
            const current = await WorkItem.findById(id).populate('assigneeId', 'name');
            if (current && current.assigneeId) {
                throw AppError.conflict(`Conflict: This work item has already been claimed or assigned to ${current.assigneeId.name || 'another user'}.`);
            }
            if (current && ['RESOLVED', 'CLOSED'].includes(current.status)) {
                throw AppError.conflict(`Conflict: Cannot claim a work item that is already ${current.status.toLowerCase()}.`);
            }
            if (current && version !== undefined && current.version !== version) {
                throw AppError.conflict(`Conflict: This work item was modified by another operation. Please refresh and try again.`, { currentVersion: current.version });
            }
            throw AppError.conflict('Claim failed due to a concurrent conflict.');
        }
        // Append-only activity
        await recordActivity({
            workItemId: claimed._id,
            actorId: user.id,
            action: 'CLAIMED',
            newValue: { assigneeId: user.id, assigneeName: user.name },
        });
        return claimed;
    }
    /**
     * Assign work item to an eligible team member with OCC check
     */
    static async assignWorkItem(user, id, data) {
        const item = await WorkItem.findById(id);
        if (!item) {
            throw AppError.notFound('WorkItem', id);
        }
        const { isLead } = await this.verifyTeamAccess(user, item.teamId.toString());
        // Ordinary members can only reassign if they are currently assigned, or Team Leads/Admins can assign anyone
        const isCurrentAssignee = item.assigneeId && item.assigneeId.toString() === user.id;
        if (!isLead && !isCurrentAssignee) {
            throw AppError.forbidden('Only Team Leads, Administrators, or the current assignee can reassign this work item');
        }
        if (data.assigneeId) {
            await this.verifyAssigneeEligibility(data.assigneeId, item.teamId.toString());
        }
        const assigned = await WorkItem.findOneAndUpdate({ _id: id, version: data.version }, {
            $set: { assigneeId: data.assigneeId || null },
            $inc: { version: 1 },
        }, { new: true })
            .populate('teamId', 'name')
            .populate('assigneeId', 'name email')
            .populate('createdBy', 'name email');
        if (!assigned) {
            const current = await WorkItem.findById(id);
            if (current) {
                throw AppError.conflict(`Conflict: Assignment failed because the work item has been updated by another user. Current version: ${current.version}.`, { currentVersion: current.version });
            }
            throw AppError.notFound('WorkItem', id);
        }
        const oldAssigneeId = item.assigneeId ? item.assigneeId.toString() : null;
        const newAssigneeId = data.assigneeId || null;
        await recordActivity({
            workItemId: assigned._id,
            actorId: user.id,
            action: newAssigneeId ? 'ASSIGNED' : 'UNASSIGNED',
            fieldChanged: 'assigneeId',
            oldValue: oldAssigneeId,
            newValue: newAssigneeId,
        });
        if (newAssigneeId) {
            await createNotification({
                recipientId: newAssigneeId,
                actorId: user.id,
                type: 'ASSIGNMENT',
                title: 'Work Item Assigned',
                message: `${user.name} assigned ${assigned.identifier} (${assigned.title}) to you`,
                workItemId: assigned._id,
            });
        }
        return assigned;
    }
    /**
     * State transitions and approval handling with OCC check
     */
    static async transitionWorkItem(user, id, data) {
        const item = await WorkItem.findById(id);
        if (!item) {
            throw AppError.notFound('WorkItem', id);
        }
        const { isLead } = await this.verifyTeamAccess(user, item.teamId.toString());
        const updateFields = {};
        // 1. Handle Approval Action
        if (data.approvalAction) {
            await WorkflowService.validateApprovalPermission(user, item.teamId.toString());
            if (data.approvalAction === 'APPROVE') {
                updateFields.approvalStatus = 'APPROVED';
                updateFields.approvedBy = user.id;
                updateFields.approvedAt = new Date();
            }
            else if (data.approvalAction === 'REJECT') {
                updateFields.approvalStatus = 'REJECTED';
                updateFields.approvedBy = user.id;
                updateFields.approvedAt = new Date();
            }
        }
        // 2. Handle Status Transition
        if (data.targetStatus) {
            // Validate against state machine
            WorkflowService.validateStatusTransition(item.status, data.targetStatus, item, user, isLead);
            updateFields.status = data.targetStatus;
            if (data.targetStatus === 'RESOLVED') {
                updateFields.resolvedAt = new Date();
            }
            else if (data.targetStatus === 'CLOSED') {
                updateFields.closedAt = new Date();
            }
        }
        // Atomic update with version check
        const updated = await WorkItem.findOneAndUpdate({ _id: id, version: data.version }, { $set: updateFields, $inc: { version: 1 } }, { new: true })
            .populate('teamId', 'name')
            .populate('assigneeId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');
        if (!updated) {
            const current = await WorkItem.findById(id);
            if (current) {
                throw AppError.conflict(`Conflict: Workflow update failed because the item was modified by another user. Current version: ${current.version}.`, { currentVersion: current.version });
            }
            throw AppError.notFound('WorkItem', id);
        }
        // Record activity for approval action
        if (data.approvalAction) {
            await recordActivity({
                workItemId: updated._id,
                actorId: user.id,
                action: data.approvalAction === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                fieldChanged: 'approvalStatus',
                oldValue: item.approvalStatus,
                newValue: updateFields.approvalStatus,
                metadata: { reason: data.reason },
            });
            if (item.assigneeId) {
                await createNotification({
                    recipientId: item.assigneeId.toString(),
                    actorId: user.id,
                    type: 'STATUS_CHANGE',
                    title: `Approval ${data.approvalAction === 'APPROVE' ? 'Granted' : 'Rejected'}`,
                    message: `${user.name} has ${data.approvalAction.toLowerCase()}d ${updated.identifier}`,
                    workItemId: updated._id,
                });
            }
        }
        // Record activity for status change
        if (data.targetStatus && data.targetStatus !== item.status) {
            await recordActivity({
                workItemId: updated._id,
                actorId: user.id,
                action: 'STATUS_CHANGED',
                fieldChanged: 'status',
                oldValue: item.status,
                newValue: data.targetStatus,
                metadata: { reason: data.reason },
            });
            // Notify assignee and creator of status change
            const recipients = new Set();
            if (updated.assigneeId)
                recipients.add(updated.assigneeId._id.toString());
            if (updated.createdBy)
                recipients.add(updated.createdBy._id.toString());
            for (const recId of recipients) {
                await createNotification({
                    recipientId: recId,
                    actorId: user.id,
                    type: 'STATUS_CHANGE',
                    title: 'Status Updated',
                    message: `${user.name} changed status of ${updated.identifier} to ${data.targetStatus}`,
                    workItemId: updated._id,
                });
            }
        }
        return updated;
    }
    /**
     * Add a discussion comment
     */
    static async addComment(user, workItemId, body) {
        const item = await WorkItem.findById(workItemId);
        if (!item) {
            throw AppError.notFound('WorkItem', workItemId);
        }
        await this.verifyTeamAccess(user, item.teamId.toString());
        const comment = await Comment.create({
            workItemId,
            authorId: user.id,
            body,
        });
        const populated = await Comment.findById(comment._id).populate('authorId', 'name email globalRole');
        // Record activity
        await recordActivity({
            workItemId: item._id,
            actorId: user.id,
            action: 'COMMENT_ADDED',
            metadata: { commentId: comment._id, snippet: body.substring(0, 100) },
        });
        // Notify assignee
        if (item.assigneeId) {
            await createNotification({
                recipientId: item.assigneeId.toString(),
                actorId: user.id,
                type: 'COMMENT_ADDED',
                title: 'New Comment on Work Item',
                message: `${user.name} commented on ${item.identifier}`,
                workItemId: item._id,
            });
        }
        return populated;
    }
    /**
     * Get all comments for a work item
     */
    static async getComments(user, workItemId) {
        const item = await WorkItem.findById(workItemId);
        if (!item) {
            throw AppError.notFound('WorkItem', workItemId);
        }
        await this.verifyTeamAccess(user, item.teamId.toString());
        return Comment.find({ workItemId })
            .populate('authorId', 'name email globalRole')
            .sort({ createdAt: 1 })
            .lean();
    }
}
