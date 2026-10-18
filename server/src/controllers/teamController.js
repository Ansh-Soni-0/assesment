import { TeamService } from '../services/teamService.js';
import { requireTeamAccess } from '../middleware/rbac.js';
export const getTeams = async (_req, res, next) => {
    try {
        const teams = await TeamService.getTeams();
        res.json({ success: true, data: teams });
    }
    catch (error) {
        next(error);
    }
};
export const getTeamById = async (req, res, next) => {
    try {
        const team = await TeamService.getTeamById(req.params.id);
        res.json({ success: true, data: team });
    }
    catch (error) {
        next(error);
    }
};
export const createTeam = async (req, res, next) => {
    try {
        const team = await TeamService.createTeam(req.user.id, req.body);
        res.status(201).json({ success: true, data: team });
    }
    catch (error) {
        next(error);
    }
};
export const updateTeam = async (req, res, next) => {
    try {
        await requireTeamAccess(req, req.params.id, 'LEAD');
        const team = await TeamService.updateTeam(req.params.id, req.body);
        res.json({ success: true, data: team });
    }
    catch (error) {
        next(error);
    }
};
export const addMember = async (req, res, next) => {
    try {
        await requireTeamAccess(req, req.params.id, 'LEAD');
        const member = await TeamService.addMember(req.params.id, req.body);
        res.status(201).json({ success: true, data: member });
    }
    catch (error) {
        next(error);
    }
};
export const updateMemberRole = async (req, res, next) => {
    try {
        await requireTeamAccess(req, req.params.id, 'LEAD');
        const member = await TeamService.updateMemberRole(req.params.id, req.params.userId, req.body);
        res.json({ success: true, data: member });
    }
    catch (error) {
        next(error);
    }
};
export const removeMember = async (req, res, next) => {
    try {
        await requireTeamAccess(req, req.params.id, 'LEAD');
        await TeamService.removeMember(req.params.id, req.params.userId);
        res.json({ success: true, message: 'Member removed from team successfully' });
    }
    catch (error) {
        next(error);
    }
};
