import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Team } from '../src/models/Team.js';
import { env } from '../src/config/env.js';
import { createApp } from '../src/app.js';
const TEST_DB_URI = 'mongodb://127.0.0.1:27017/newtonite_test_suite';
export const app = createApp();
export async function setupTestDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(TEST_DB_URI);
    }
}
export async function clearTestDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}
export async function teardownTestDB() {
    await clearTestDB();
    await mongoose.disconnect();
}
export async function createTestUser(overrides = {}) {
    const salt = await bcrypt.genSalt(6);
    const passwordHash = await bcrypt.hash(overrides.passwordHash || 'TestPass123!', salt);
    const email = overrides.email || `user_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
    const user = await User.create({
        name: overrides.name || 'Test User',
        email: email.toLowerCase(),
        passwordHash,
        globalRole: overrides.globalRole || 'MEMBER',
        isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    });
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return { user, token };
}
export async function createTestTeam(creatorId, name) {
    const team = await Team.create({
        name: name || `Test Team ${Date.now()}_${Math.random().toString(36).substring(7)}`,
        description: 'Test Team Description',
        createdBy: creatorId,
    });
    return team;
}
