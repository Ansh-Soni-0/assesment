import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser } from './setup.js';
describe('1 & 2: Authentication Suite', () => {
    beforeAll(async () => {
        await setupTestDB();
    });
    afterAll(async () => {
        await teardownTestDB();
    });
    beforeEach(async () => {
        await clearTestDB();
    });
    it('1.1: should authenticate successfully with valid credentials and return JWT & user details', async () => {
        const { user } = await createTestUser({ email: 'valid@newtonite.local' });
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'valid@newtonite.local', password: 'TestPass123!' });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.email).toBe('valid@newtonite.local');
        expect(response.body.data.user.id).toBe(user._id.toString());
        expect(response.headers['set-cookie']).toBeDefined();
    });
    it('1.2: should reject login with invalid password', async () => {
        await createTestUser({ email: 'valid2@newtonite.local' });
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'valid2@newtonite.local', password: 'WrongPassword999!' });
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
    it('1.3: should reject login for non-existent email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'unknown@newtonite.local', password: 'Password123!' });
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
    it('1.4: should reject login for deactivated user account', async () => {
        await createTestUser({ email: 'inactive@newtonite.local', isActive: false });
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'inactive@newtonite.local', password: 'TestPass123!' });
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
        expect(response.body.error.message).toContain('deactivated');
    });
    it('2.1: should reject requests to protected endpoints when no token is supplied', async () => {
        const response = await request(app).get('/api/auth/me');
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
    it('2.2: should reject requests with invalid/tampered token', async () => {
        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid-token-signature');
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
    it('2.3: should succeed on protected endpoint with valid Authorization header', async () => {
        const { token, user } = await createTestUser();
        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.id).toBe(user._id.toString());
    });
});
