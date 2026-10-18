import { Team } from '../models/Team.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { User } from '../models/User.js';
import { WorkItem } from '../models/WorkItem.js';
import { AppError } from '../utils/errors.js';
export class TeamService {
    static async getTeams() {
        const teams = await Team.find().sort({ name: 1 }).populate('createdBy', 'name email').lean();
        // Enrich with member count and open work item count
        const enriched = await Promise.all(teams.map(async (t) => {
            const [memberCount, openItemCount] = await Promise.all([
                TeamMembership.countDocuments({ teamId: t._id }),
                WorkItem.countDocuments({ teamId: t._id, status: { $nin: ['RESOLVED', 'CLOSED'] } }),
            ]);
            return {
                ...t,
                memberCount,
                openItemCount,
            };
        }));
        return enriched;
    }
    static async getTeamById(id) {
        const team = await Team.findById(id).populate('createdBy', 'name email').lean();
        if (!team) {
            throw AppError.notFound('Team', id);
        }
        const members = await TeamMembership.find({ teamId: id })
            .populate('userId', 'name email globalRole isActive')
            .sort({ role: 1, createdAt: 1 })
            .lean();
        return {
            ...team,
            members,
        };
    }
    static async createTeam(userId, data) {
        const existing = await Team.findOne({ name: data.name });
        if (existing) {
            throw AppError.conflict('A team with this name already exists');
        }
        const team = new Team({
            name: data.name,
            description: data.description || '',
            createdBy: userId,
        });
        await team.save();
        // Automatically add creator as LEAD
        await TeamMembership.create({
            userId,
            teamId: team._id,
            role: 'LEAD',
        });
        return team;
    }
    static async updateTeam(id, data) {
        const team = await Team.findById(id);
        if (!team) {
            throw AppError.notFound('Team', id);
        }
        if (data.name && data.name !== team.name) {
            const existing = await Team.findOne({ name: data.name });
            if (existing) {
                throw AppError.conflict('A team with this name already exists');
            }
            team.name = data.name;
        }
        if (data.description !== undefined) {
            team.description = data.description;
        }
        await team.save();
        return team;
    }
    static async addMember(teamId, data) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw AppError.notFound('Team', teamId);
        }
        const user = await User.findById(data.userId);
        if (!user) {
            throw AppError.notFound('User', data.userId);
        }
        const existing = await TeamMembership.findOne({ teamId, userId: data.userId });
        if (existing) {
            throw AppError.conflict('User is already a member of this team');
        }
        const membership = new TeamMembership({
            teamId,
            userId: data.userId,
            role: data.role || 'MEMBER',
        });
        await membership.save();
        return membership;
    }
    static async updateMemberRole(teamId, userId, data) {
        const membership = await TeamMembership.findOne({ teamId, userId });
        if (!membership) {
            throw AppError.notFound('TeamMembership');
        }
        membership.role = data.role;
        await membership.save();
        return membership;
    }
    static async removeMember(teamId, userId) {
        const result = await TeamMembership.findOneAndDelete({ teamId, userId });
        if (!result) {
            throw AppError.notFound('TeamMembership');
        }
        // Unassign work items assigned to this member in this team
        await WorkItem.updateMany({ teamId, assigneeId: userId, status: { $nin: ['RESOLVED', 'CLOSED'] } }, { $set: { assigneeId: null } });
    }
}
