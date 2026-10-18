import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestTeam } from './setup.js';
import { TeamMembership } from '../src/models/TeamMembership.js';
import { WorkItem } from '../src/models/WorkItem.js';
import { Counter } from '../src/models/Counter.js';
describe('6, 7 & 8: Concurrency, OCC & Idempotency Suite', () => {
    beforeAll(async () => {
        await setupTestDB();
    });
    afterAll(async () => {
        await teardownTestDB();
    });
    beforeEach(async () => {
        await clearTestDB();
        await Counter.findOneAndUpdate({ name: 'workItemId' }, { $set: { seq: 2000 } }, { upsert: true, new: true });
    });
    it('6: two simultaneous claim requests produce exactly one success and one HTTP 409 conflict', async () => {
        const { user: user1, token: token1 } = await createTestUser({ name: 'Claimer 1' });
        const { user: user2, token: token2 } = await createTestUser({ name: 'Claimer 2' });
        const team = await createTestTeam(user1._id, 'Ops Team');
        await TeamMembership.create({ userId: user1._id, teamId: team._id, role: 'MEMBER' });
        await TeamMembership.create({ userId: user2._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-2001',
            title: 'High Load Incident',
            description: 'Incident requiring immediate claim',
            type: 'PRODUCTION_INCIDENT',
            status: 'OPEN',
            priority: 'URGENT',
            teamId: team._id,
            assigneeId: null,
            createdBy: user1._id,
            version: 1,
        });
        // Execute concurrent claim requests simultaneously
        const [res1, res2] = await Promise.all([
            request(app)
                .post(`/api/work-items/${item._id}/claim`)
                .set('Authorization', `Bearer ${token1}`)
                .send({}),
            request(app)
                .post(`/api/work-items/${item._id}/claim`)
                .set('Authorization', `Bearer ${token2}`)
                .send({}),
        ]);
        const statuses = [res1.status, res2.status].sort();
        // Exactly one should be 200 and one should be 409
        expect(statuses).toEqual([200, 409]);
        const winner = res1.status === 200 ? res1 : res2;
        const loser = res1.status === 409 ? res1 : res2;
        expect(winner.body.success).toBe(true);
        expect(winner.body.data.assigneeId).toBeDefined();
        expect(loser.body.error.code).toBe('CONFLICT');
        expect(loser.body.error.message).toContain('already been claimed');
        // Verify database state: only one assignee
        const finalItem = await WorkItem.findById(item._id);
        expect(finalItem.assigneeId).toBeDefined();
        expect(finalItem.version).toBe(2);
    });
    it('7: stale-version update is rejected with HTTP 409 conflict without overwriting server state', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        const item = await WorkItem.create({
            identifier: 'NW-2002',
            title: 'Original Title',
            description: 'Original Description',
            type: 'OPERATIONAL_TASK',
            status: 'OPEN',
            priority: 'LOW',
            teamId: team._id,
            createdBy: user._id,
            version: 1,
        });
        // User A updates item to version 2
        const update1 = await request(app)
            .patch(`/api/work-items/${item._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            version: 1,
            title: 'Updated by User A',
        });
        expect(update1.status).toBe(200);
        expect(update1.body.data.version).toBe(2);
        expect(update1.body.data.title).toBe('Updated by User A');
        // User B (who still had version 1 cached) attempts to update
        const staleUpdate = await request(app)
            .patch(`/api/work-items/${item._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            version: 1, // Stale version!
            title: 'Conflicting Stale Update by User B',
        });
        expect(staleUpdate.status).toBe(409);
        expect(staleUpdate.body.error.code).toBe('CONFLICT');
        expect(staleUpdate.body.error.message).toContain('expected version 1, current server version is 2');
        // Verify database retained User A's update
        const freshItem = await WorkItem.findById(item._id);
        expect(freshItem.title).toBe('Updated by User A');
        expect(freshItem.version).toBe(2);
    });
    it('8: idempotent retries return original resource without creating duplicate work items', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        const idempotencyKey = 'req-key-xyz-789';
        const payload = {
            title: 'Network Partition Detection',
            description: 'Diagnose intermittent packet drop between AZs',
            type: 'ENGINEERING_PROBLEM',
            priority: 'HIGH',
            teamId: team._id.toString(),
        };
        // First request
        const firstRes = await request(app)
            .post('/api/work-items')
            .set('Authorization', `Bearer ${token}`)
            .set('Idempotency-Key', idempotencyKey)
            .send(payload);
        expect(firstRes.status).toBe(201);
        const createdId = firstRes.body.data._id;
        const identifier = firstRes.body.data.identifier;
        // Second request (identical retry due to network timeout or double-click)
        const retryRes = await request(app)
            .post('/api/work-items')
            .set('Authorization', `Bearer ${token}`)
            .set('Idempotency-Key', idempotencyKey)
            .send(payload);
        expect(retryRes.status).toBe(201);
        expect(retryRes.headers['x-idempotent-replay']).toBe('true');
        expect(retryRes.body.data._id).toBe(createdId);
        expect(retryRes.body.data.identifier).toBe(identifier);
        // Verify only ONE work item was created in database
        const totalCount = await WorkItem.countDocuments({ teamId: team._id });
        expect(totalCount).toBe(1);
        // Third request: reusing same idempotency key with DIFFERENT payload must be rejected
        const alteredPayload = {
            ...payload,
            title: 'Completely Different Title Using Same Key',
        };
        const conflictRes = await request(app)
            .post('/api/work-items')
            .set('Authorization', `Bearer ${token}`)
            .set('Idempotency-Key', idempotencyKey)
            .send(alteredPayload);
        expect(conflictRes.status).toBe(409);
        expect(conflictRes.body.error.code).toBe('CONFLICT');
        expect(conflictRes.body.error.message).toContain('different request payload');
    });
});
