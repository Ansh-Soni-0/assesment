import { TeamMembership } from '../models/TeamMembership.js';
import { AppError } from '../utils/errors.js';
export const requireGlobalRole = (allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(AppError.unauthorized());
        }
        if (!allowedRoles.includes(req.user.globalRole)) {
            return next(AppError.forbidden(`Action requires one of the following global roles: ${allowedRoles.join(', ')}`));
        }
        next();
    };
};
export const getUserTeamMembership = async (userId, teamId) => {
    const membership = await TeamMembership.findOne({ userId, teamId });
    if (!membership) {
        return { isMember: false, role: null };
    }
    return { isMember: true, role: membership.role };
};
export const requireTeamAccess = async (req, teamId, requiredTeamRole) => {
    if (!req.user) {
        throw AppError.unauthorized();
    }
    // ADMIN and OPERATOR have company-wide operational access
    if (req.user.globalRole === 'ADMIN' || req.user.globalRole === 'OPERATOR') {
        return;
    }
    const { isMember, role } = await getUserTeamMembership(req.user.id, teamId);
    if (!isMember) {
        throw AppError.forbidden('You are not a member of the team associated with this resource');
    }
    if (requiredTeamRole && role !== requiredTeamRole) {
        throw AppError.forbidden(`This operation requires team role '${requiredTeamRole}'`);
    }
};
