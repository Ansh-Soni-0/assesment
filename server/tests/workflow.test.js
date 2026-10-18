import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestTeam } from './setup.js';
import { TeamMembership } from '../src/models/TeamMembership.js';
import { WorkItem } from '../src/models/WorkItem.js';
import { Activity } from '../src/models/Activity.js';
describe('9, 10, 11 & 12: Workflow Validation & Activity Consistency Suite', () => {
    beforeAll(async () => {
        await setupTestDB();
    });
    afterAll(async () => {
        await teardownTestDB();
    });
    beforeEach(async () => {
        await clearTestDB();
    });
    it('9: invalid workflow transitions are strictly rejected by state machine', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-3001',
            title: 'Workflow Test Item',
            description: 'Testing transition rules',
            type: 'OPERATIONAL_TASK',
            status: 'OPEN',
            priority: 'MEDIUM',
            teamId: team._id,
            createdBy: user._id,
            version: 1,
        });
        // OPEN cannot directly jump to RESOLVED (must be IN_PROGRESS first)
        const invalidRes = await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            version: 1,
            targetStatus: 'RESOLVED',
        });
        expect(invalidRes.status).toBe(400);
        expect(invalidRes.body.error.code).toBe('BAD_REQUEST');
        expect(invalidRes.body.error.message).toContain("Invalid status transition from 'OPEN' to 'RESOLVED'");
        // Verify status was NOT changed in database
        const fresh = await WorkItem.findById(item._id);
        expect(fresh.status).toBe('OPEN');
    });
    it('10: required approvals are enforced before resolving or closing work items', async () => {
        const { user: member, token: memberToken } = await createTestUser({ name: 'Member Worker' });
        const { user: lead, token: leadToken } = await createTestUser({ name: 'Team Lead' });
        const team = await createTestTeam(lead._id);
        await TeamMembership.create({ userId: lead._id, teamId: team._id, role: 'LEAD' });
        await TeamMembership.create({ userId: member._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-3002',
            title: 'Regulated Financial Adjustment',
            description: 'Customer credit requiring approval',
            type: 'PAYMENT_INVESTIGATION',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            teamId: team._id,
            assigneeId: member._id,
            createdBy: member._id,
            requiresApproval: true,
            approvalStatus: 'PENDING',
            version: 1,
        });
        // 10.1: Attempting to resolve without approval should fail
        const unapprovedResolve = await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${memberToken}`)
            .send({
            version: 1,
            targetStatus: 'RESOLVED',
        });
        expect(unapprovedResolve.status).toBe(400);
        expect(unapprovedResolve.body.error.message).toContain('requires formal approval');
        // 10.2: Ordinary member attempts to approve -> Must be forbidden (403)
        const unauthorizedApproval = await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${memberToken}`)
            .send({
            version: 1,
            approvalAction: 'APPROVE',
        });
        expect(unauthorizedApproval.status).toBe(403);
        expect(unauthorizedApproval.body.error.message).toContain('Only Team Leads or Administrators are authorized');
        // 10.3: Team Lead grants approval
        const leadApproval = await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${leadToken}`)
            .send({
            version: 1,
            approvalAction: 'APPROVE',
        });
        expect(leadApproval.status).toBe(200);
        expect(leadApproval.body.data.approvalStatus).toBe('APPROVED');
        expect(leadApproval.body.data.version).toBe(2);
        // 10.4: Now resolving is permitted
        const approvedResolve = await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${memberToken}`)
            .send({
            version: 2,
            targetStatus: 'RESOLVED',
        });
        expect(approvedResolve.status).toBe(200);
        expect(approvedResolve.body.data.status).toBe('RESOLVED');
    });
    it('11: successful changes create correct append-only activity records identifying actor', async () => {
        const { user, token } = await createTestUser({ name: 'Active Worker' });
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-3003',
            title: 'Activity Tracking Test',
            description: 'Testing activity log persistence',
            type: 'OPERATIONAL_TASK',
            status: 'OPEN',
            priority: 'LOW',
            teamId: team._id,
            createdBy: user._id,
            version: 1,
        });
        // Perform valid transition to IN_PROGRESS
        const res = await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            version: 1,
            targetStatus: 'IN_PROGRESS',
            reason: 'Beginning active development',
        });
        expect(res.status).toBe(200);
        // Check activity records in database
        const activities = await Activity.find({ workItemId: item._id });
        expect(activities.length).toBe(1);
        expect(activities[0].action).toBe('STATUS_CHANGED');
        expect(activities[0].actorId.toString()).toBe(user._id.toString());
        expect(activities[0].oldValue).toBe('OPEN');
        expect(activities[0].newValue).toBe('IN_PROGRESS');
        expect(activities[0].metadata).toEqual({ reason: 'Beginning active development' });
    });
    it('12: failed operations do NOT create false activity records', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-3004',
            title: 'False Activity Prevention',
            description: 'Testing that rejected updates generate no phantom records',
            type: 'OPERATIONAL_TASK',
            status: 'OPEN',
            priority: 'LOW',
            teamId: team._id,
            createdBy: user._id,
            version: 1,
        });
        // Attempt illegal transition
        await request(app)
            .post(`/api/work-items/${item._id}/transition`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            version: 1,
            targetStatus: 'CLOSED', // Invalid transition from OPEN
        });
        // Verify zero activity records exist for this item
        const activities = await Activity.find({ workItemId: item._id });
        expect(activities.length).toBe(0);
    });
});
