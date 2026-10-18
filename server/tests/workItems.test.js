import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestTeam } from './setup.js';
import { TeamMembership } from '../src/models/TeamMembership.js';
import { WorkItem } from '../src/models/WorkItem.js';
import { Counter } from '../src/models/Counter.js';
describe('4 & 13: Work Item Validation & Server-Side Pagination/Filtering Suite', () => {
    beforeAll(async () => {
        await setupTestDB();
    });
    afterAll(async () => {
        await teardownTestDB();
    });
    beforeEach(async () => {
        await clearTestDB();
        await Counter.findOneAndUpdate({ name: 'workItemId' }, { $set: { seq: 3000 } }, { upsert: true, new: true });
    });
    it('4.1: should create work item successfully with valid fields', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        const payload = {
            title: 'Valid Creation Title',
            description: 'Detailed description of the issue at hand',
            type: 'CUSTOMER_ISSUE',
            priority: 'HIGH',
            teamId: team._id.toString(),
            requiresApproval: true,
        };
        const response = await request(app)
            .post('/api/work-items')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.identifier).toMatch(/^NW-\d+$/);
        expect(response.body.data.version).toBe(1);
        expect(response.body.data.approvalStatus).toBe('PENDING');
    });
    it('4.2: should reject work item creation with invalid or missing required fields', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        // Missing title and description, invalid type
        const response = await request(app)
            .post('/api/work-items')
            .set('Authorization', `Bearer ${token}`)
            .send({
            type: 'INVALID_WORK_TYPE',
            teamId: team._id.toString(),
        });
        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toBeDefined();
    });
    it('13.1: server-side pagination respects limit and calculates totalPages accurately', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        // Insert 25 items
        const items = [];
        for (let i = 1; i <= 25; i++) {
            items.push({
                identifier: `NW-40${i.toString().padStart(2, '0')}`,
                title: `Item #${i} for pagination test`,
                description: `Description for item ${i}`,
                type: 'OPERATIONAL_TASK',
                status: 'OPEN',
                priority: 'MEDIUM',
                teamId: team._id,
                createdBy: user._id,
                version: 1,
            });
        }
        await WorkItem.insertMany(items);
        // Page 1 with limit 10
        const page1 = await request(app)
            .get('/api/work-items?page=1&limit=10')
            .set('Authorization', `Bearer ${token}`);
        expect(page1.status).toBe(200);
        expect(page1.body.data.items.length).toBe(10);
        expect(page1.body.data.pagination.total).toBe(25);
        expect(page1.body.data.pagination.totalPages).toBe(3);
        expect(page1.body.data.pagination.page).toBe(1);
        // Page 3 with limit 10 (should have 5 items)
        const page3 = await request(app)
            .get('/api/work-items?page=3&limit=10')
            .set('Authorization', `Bearer ${token}`);
        expect(page3.status).toBe(200);
        expect(page3.body.data.items.length).toBe(5);
    });
    it('13.2: server-side filtering by status, priority, and text search', async () => {
        const { user, token } = await createTestUser();
        const team = await createTestTeam(user._id);
        await TeamMembership.create({ userId: user._id, teamId: team._id, role: 'MEMBER' });
        await WorkItem.create([
            {
                identifier: 'NW-5001',
                title: 'Kubernetes cluster failure',
                description: 'Node kernel panic in eu-central-1',
                type: 'PRODUCTION_INCIDENT',
                status: 'BLOCKED',
                priority: 'URGENT',
                teamId: team._id,
                createdBy: user._id,
                version: 1,
            },
            {
                identifier: 'NW-5002',
                title: 'Routine backup check',
                description: 'Verify S3 glacier restore drill',
                type: 'OPERATIONAL_TASK',
                status: 'RESOLVED',
                priority: 'LOW',
                teamId: team._id,
                createdBy: user._id,
                version: 1,
            },
            {
                identifier: 'NW-5003',
                title: 'Chargeback dispute for merchant #883',
                description: 'Investigation with Visa network',
                type: 'PAYMENT_INVESTIGATION',
                status: 'OPEN',
                priority: 'MEDIUM',
                teamId: team._id,
                createdBy: user._id,
                version: 1,
            },
        ]);
        // Filter by priority URGENT
        const resPriority = await request(app)
            .get('/api/work-items?priority=URGENT')
            .set('Authorization', `Bearer ${token}`);
        expect(resPriority.status).toBe(200);
        expect(resPriority.body.data.items.length).toBe(1);
        expect(resPriority.body.data.items[0].identifier).toBe('NW-5001');
        // Filter by status RESOLVED
        const resStatus = await request(app)
            .get('/api/work-items?status=RESOLVED')
            .set('Authorization', `Bearer ${token}`);
        expect(resStatus.status).toBe(200);
        expect(resStatus.body.data.items.length).toBe(1);
        expect(resStatus.body.data.items[0].identifier).toBe('NW-5002');
        // Search by text "Kubernetes"
        const resSearch = await request(app)
            .get('/api/work-items?search=Kubernetes')
            .set('Authorization', `Bearer ${token}`);
        expect(resSearch.status).toBe(200);
        expect(resSearch.body.data.items.length).toBe(1);
        expect(resSearch.body.data.items[0].title).toContain('Kubernetes');
    });
});
