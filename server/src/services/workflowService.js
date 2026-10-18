import { AppError } from '../utils/errors.js';
import { getUserTeamMembership } from '../middleware/rbac.js';
export const ALLOWED_TRANSITIONS = {
    OPEN: ['IN_PROGRESS', 'BLOCKED'],
    IN_PROGRESS: ['BLOCKED', 'RESOLVED', 'OPEN'],
    BLOCKED: ['OPEN', 'IN_PROGRESS'],
    RESOLVED: ['CLOSED', 'IN_PROGRESS'],
    CLOSED: ['OPEN'],
};
export class WorkflowService {
    /**
     * Validates whether a status transition is permitted according to workflow rules
     */
    static validateStatusTransition(currentStatus, targetStatus, item, user, isTeamLead) {
        if (currentStatus === targetStatus) {
            throw AppError.badRequest(`Work item is already in status '${currentStatus}'`);
        }
        const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus];
        if (!allowedNextStatuses || !allowedNextStatuses.includes(targetStatus)) {
            throw AppError.badRequest(`Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowedNextStatuses.join(', ')}`);
        }
        // Reopening a closed item requires Team Lead or Admin role
        if (currentStatus === 'CLOSED' && targetStatus === 'OPEN') {
            if (user.globalRole !== 'ADMIN' && !isTeamLead) {
                throw AppError.forbidden('Only Team Leads or System Administrators can reopen a closed work item');
            }
        }
        // Enforce approval gate before resolving or closing
        if ((targetStatus === 'RESOLVED' || targetStatus === 'CLOSED') && item.requiresApproval) {
            if (item.approvalStatus !== 'APPROVED') {
                throw AppError.badRequest(`Cannot transition to '${targetStatus}': this item requires formal approval before it can be resolved or closed. Current approval status: ${item.approvalStatus}`);
            }
        }
    }
    /**
     * Validates whether a user is authorized to perform approval decisions
     */
    static async validateApprovalPermission(user, teamId) {
        if (user.globalRole === 'ADMIN')
            return true;
        const { isMember, role } = await getUserTeamMembership(user.id, teamId);
        if (!isMember || role !== 'LEAD') {
            throw AppError.forbidden('Only Team Leads or Administrators are authorized to review and approve work items');
        }
        return true;
    }
}
