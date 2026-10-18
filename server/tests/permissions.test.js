import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestTeam } from './setup.js';
import { TeamMembership } from '../src/models/TeamMembership.js';
import { WorkItem } from '../src/models/WorkItem.js';
describe('3 & 5: Role & Team Permissions Suite', () => {
    beforeAll(async () => {
        await setupTestDB();
    });
    afterAll(async () => {
        await teardownTestDB();
    });
    beforeEach(async () => {
        await clearTestDB();
    });
    it('3.1: non-admin user cannot create new users via administrative API', async () => {
        const { token } = await createTestUser({ globalRole: 'MEMBER' });
        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'New Person',
            email: 'person@newtonite.local',
            password: 'Password123!',
            globalRole: 'MEMBER',
        });
        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
    });
    it('3.2: admin user can create new users via administrative API', async () => {
        const { token } = await createTestUser({ globalRole: 'ADMIN' });
        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'New Authorized Person',
            email: 'authorized@newtonite.local',
            password: 'Password123!',
            globalRole: 'MEMBER',
        });
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('authorized@newtonite.local');
    });
    it('3.3: user cannot access work item belonging to a team they do not belong to', async () => {
        const { user: userA, token: tokenA } = await createTestUser();
        const { user: userB, token: tokenB } = await createTestUser();
        const teamA = await createTestTeam(userA._id, 'Team A');
        await TeamMembership.create({ userId: userA._id, teamId: teamA._id, role: 'MEMBER' });
        const workItemA = await WorkItem.create({
            identifier: 'NW-9001',
            title: 'Secret Team A Item',
            description: 'Confidential investigation for Team A',
            type: 'OPERATIONAL_TASK',
            status: 'OPEN',
            priority: 'MEDIUM',
            teamId: teamA._id,
            createdBy: userA._id,
            version: 1,
        });
        // User B is not in Team A -> Must be forbidden (403)
        const response = await request(app)
            .get(`/api/work-items/${workItemA._id}`)
            .set('Authorization', `Bearer ${tokenB}`);
        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
    });
    it('5.1: should prevent assigning an item to an ineligible employee not belonging to the team at creation', async () => {
        const { user: creator, token: creatorToken } = await createTestUser();
        const { user: outsider } = await createTestUser({ name: 'Outsider User' });
        const team = await createTestTeam(creator._id, 'Engineers');
        await TeamMembership.create({ userId: creator._id, teamId: team._id, role: 'LEAD' });
        // Attempt to create item in 'Engineers' assigned to 'outsider' (not in Engineers)
        const response = await request(app)
            .post('/api/work-items')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
            title: 'Fix Engine Leak',
            description: 'Urgent fix needed for engine leak',
            type: 'ENGINEERING_PROBLEM',
            teamId: team._id.toString(),
            assigneeId: outsider._id.toString(),
        });
        expect(response.status).toBe(400);
        expect(response.body.error.message).toContain('does not belong to the selected team');
    });
    it('5.2: should prevent reassigning an existing work item to an ineligible employee', async () => {
        const { user: lead, token: leadToken } = await createTestUser();
        const { user: eligibleMember } = await createTestUser();
        const { user: outsider } = await createTestUser();
        const team = await createTestTeam(lead._id, 'Support');
        await TeamMembership.create({ userId: lead._id, teamId: team._id, role: 'LEAD' });
        await TeamMembership.create({ userId: eligibleMember._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-9002',
            title: 'Support Inquiry',
            description: 'Customer inquiry',
            type: 'CUSTOMER_ISSUE',
            status: 'OPEN',
            priority: 'LOW',
            teamId: team._id,
            assigneeId: eligibleMember._id,
            createdBy: lead._id,
            version: 1,
        });
        // Attempt to reassign to outsider
        const response = await request(app)
            .post(`/api/work-items/${item._id}/assign`)
            .set('Authorization', `Bearer ${leadToken}`)
            .send({
            version: 1,
            assigneeId: outsider._id.toString(),
        });
        expect(response.status).toBe(400);
        expect(response.body.error.message).toContain('does not belong to the selected team');
    });
});
