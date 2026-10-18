import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { WorkItem } from '../models/WorkItem.js';
import { Activity } from '../models/Activity.js';
import { Comment } from '../models/Comment.js';
import { Counter } from '../models/Counter.js';
import { Notification } from '../models/Notification.js';
import { logger } from '../utils/logger.js';
async function seed() {
    if (env.NODE_ENV === 'production') {
        logger.error('Safety check failed: Seeding is prohibited in production environment!');
        process.exit(1);
    }
    logger.info('Connecting to database for seeding...');
    await connectDB();
    logger.info('Clearing existing development data...');
    await Promise.all([
        User.deleteMany({}),
        Team.deleteMany({}),
        TeamMembership.deleteMany({}),
        WorkItem.deleteMany({}),
        Activity.deleteMany({}),
        Comment.deleteMany({}),
        Counter.deleteMany({}),
        Notification.deleteMany({}),
    ]);
    // Initialize Counter
    await Counter.create({ name: 'workItemId', seq: 1000 });
    logger.info('Creating development users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);
    const admin = await User.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: adminPasswordHash,
        globalRole: 'ADMIN',
        isActive: true,
    });
    const sarah = await User.create({
        name: 'Sarah Chen',
        email: 'sarah.chen@newtonite.local',
        passwordHash: defaultPasswordHash,
        globalRole: 'MEMBER',
        isActive: true,
    });
    const marcus = await User.create({
        name: 'Marcus Vance',
        email: 'marcus.vance@newtonite.local',
        passwordHash: defaultPasswordHash,
        globalRole: 'MEMBER',
        isActive: true,
    });
    const elena = await User.create({
        name: 'Elena Rostova',
        email: 'elena.rostova@newtonite.local',
        passwordHash: defaultPasswordHash,
        globalRole: 'MEMBER',
        isActive: true,
    });
    const david = await User.create({
        name: 'David Kim',
        email: 'david.kim@newtonite.local',
        passwordHash: defaultPasswordHash,
        globalRole: 'MEMBER',
        isActive: true,
    });
    const priya = await User.create({
        name: 'Priya Patel',
        email: 'priya.patel@newtonite.local',
        passwordHash: defaultPasswordHash,
        globalRole: 'MEMBER',
        isActive: true,
    });
    logger.info('Creating teams...');
    const infraTeam = await Team.create({
        name: 'Core Platform & Infrastructure',
        description: 'Cloud reliability, database performance, microservices architecture, and system scalability',
        createdBy: admin._id,
    });
    const paymentsTeam = await Team.create({
        name: 'Payments & Risk Operations',
        description: 'Transaction investigations, payment gateway disputes, fraud analysis, and AML compliance',
        createdBy: admin._id,
    });
    const supportTeam = await Team.create({
        name: 'Customer Support Escalations',
        description: 'Tier-3 enterprise support, SLA escalation management, and account incident resolution',
        createdBy: admin._id,
    });
    logger.info('Creating team memberships (multi-team roles)...');
    await TeamMembership.insertMany([
        // Infra Team
        { userId: sarah._id, teamId: infraTeam._id, role: 'LEAD' },
        { userId: elena._id, teamId: infraTeam._id, role: 'MEMBER' },
        { userId: admin._id, teamId: infraTeam._id, role: 'LEAD' },
        // Payments Team
        { userId: marcus._id, teamId: paymentsTeam._id, role: 'LEAD' },
        { userId: elena._id, teamId: paymentsTeam._id, role: 'MEMBER' }, // Cross-functional membership
        { userId: david._id, teamId: paymentsTeam._id, role: 'MEMBER' },
        // Customer Support Team
        { userId: david._id, teamId: supportTeam._id, role: 'LEAD' },
        { userId: priya._id, teamId: supportTeam._id, role: 'MEMBER' },
        { userId: marcus._id, teamId: supportTeam._id, role: 'MEMBER' },
    ]);
    logger.info('Creating representative operational work items...');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const itemsData = [
        {
            identifier: 'NW-1001',
            title: 'Database connection pool exhaustion on Europe cluster',
            description: 'Production primary MongoDB replica experiencing high connection spikes during checkout peak hours. Immediate connection pooling review required.',
            type: 'PRODUCTION_INCIDENT',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            teamId: infraTeam._id,
            assigneeId: sarah._id,
            createdBy: admin._id,
            dueDate: new Date(now + oneDay),
            requiresApproval: true,
            approvalStatus: 'PENDING',
            version: 1,
        },
        {
            identifier: 'NW-1002',
            title: 'Stripe webhook retry storm causing duplicated ledger transactions',
            description: 'Transient 504 Gateway Timeouts from payment listener service caused Stripe retry bursts, leading to duplicate ledger records on 14 accounts.',
            type: 'PAYMENT_INVESTIGATION',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            teamId: paymentsTeam._id,
            assigneeId: marcus._id,
            createdBy: elena._id,
            dueDate: new Date(now + 2 * oneDay),
            requiresApproval: true,
            approvalStatus: 'APPROVED',
            approvedBy: marcus._id,
            approvedAt: new Date(now - oneDay),
            version: 2,
        },
        {
            identifier: 'NW-1003',
            title: 'Unassigned: Enterprise SLA breach risk for Acme Corp SSO failure',
            description: 'Acme Corp unable to authenticate SAML 2.0 federation after cert renewal. Severity 1 ticket waiting for claim.',
            type: 'CUSTOMER_ISSUE',
            status: 'OPEN',
            priority: 'URGENT',
            teamId: supportTeam._id,
            assigneeId: null,
            createdBy: david._id,
            dueDate: new Date(now - oneDay), // Overdue!
            requiresApproval: false,
            approvalStatus: 'NONE',
            version: 1,
        },
        {
            identifier: 'NW-1004',
            title: 'Quarterly SOC2 compliance access log audit preparation',
            description: 'Extract and cross-verify access logs for privileged database access across Q3 to prepare external auditor evidence package.',
            type: 'COMPLIANCE_REQUEST',
            status: 'OPEN',
            priority: 'MEDIUM',
            teamId: paymentsTeam._id,
            assigneeId: elena._id,
            createdBy: marcus._id,
            dueDate: new Date(now + 7 * oneDay),
            requiresApproval: true,
            approvalStatus: 'PENDING',
            version: 1,
        },
        {
            identifier: 'NW-1005',
            title: 'Redis cluster cache memory fragmentation mitigation',
            description: 'Memory defragmentation script tested on staging. Need scheduled maintenance window approval before running on prod.',
            type: 'ENGINEERING_PROBLEM',
            status: 'BLOCKED',
            priority: 'HIGH',
            teamId: infraTeam._id,
            assigneeId: elena._id,
            createdBy: sarah._id,
            dueDate: new Date(now + 3 * oneDay),
            requiresApproval: true,
            approvalStatus: 'PENDING',
            version: 2,
        },
        {
            identifier: 'NW-1006',
            title: 'Automated notification template translation sync',
            description: 'Synchronize Spanish and German email notification copy for password reset and team invitations.',
            type: 'OPERATIONAL_TASK',
            status: 'RESOLVED',
            priority: 'LOW',
            teamId: supportTeam._id,
            assigneeId: priya._id,
            createdBy: david._id,
            dueDate: new Date(now - 2 * oneDay),
            requiresApproval: false,
            approvalStatus: 'NONE',
            resolvedAt: new Date(now - oneDay),
            version: 3,
        },
        {
            identifier: 'NW-1007',
            title: 'Legacy customer billing discrepancy reconciliation (April)',
            description: 'Completed audit of 12 invoice mismatches and dispatched credited adjustment balances.',
            type: 'PAYMENT_INVESTIGATION',
            status: 'CLOSED',
            priority: 'MEDIUM',
            teamId: paymentsTeam._id,
            assigneeId: marcus._id,
            createdBy: david._id,
            dueDate: new Date(now - 5 * oneDay),
            requiresApproval: true,
            approvalStatus: 'APPROVED',
            approvedBy: marcus._id,
            approvedAt: new Date(now - 4 * oneDay),
            resolvedAt: new Date(now - 3 * oneDay),
            closedAt: new Date(now - 2 * oneDay),
            version: 4,
        },
        {
            identifier: 'NW-1008',
            title: 'Unassigned: Rate-limiting tuning for public tracking API',
            description: 'Bot traffic scraping tracking endpoints. Needs token bucket configuration in Cloudflare and ingress gateway.',
            type: 'ENGINEERING_PROBLEM',
            status: 'OPEN',
            priority: 'HIGH',
            teamId: infraTeam._id,
            assigneeId: null,
            createdBy: sarah._id,
            dueDate: new Date(now + 2 * oneDay),
            requiresApproval: false,
            approvalStatus: 'NONE',
            version: 1,
        },
    ];
    const workItems = await WorkItem.insertMany(itemsData);
    // Update Counter to match
    await Counter.findOneAndUpdate({ name: 'workItemId' }, { seq: 1008 });
    logger.info('Creating activity audit trails and comments...');
    for (const item of workItems) {
        // Creation activity
        await Activity.create({
            workItemId: item._id,
            actorId: item.createdBy,
            action: 'CREATED',
            newValue: {
                title: item.title,
                priority: item.priority,
                type: item.type,
            },
            createdAt: new Date(now - 3 * oneDay),
        });
        if (item.assigneeId) {
            await Activity.create({
                workItemId: item._id,
                actorId: item.createdBy,
                action: 'ASSIGNED',
                fieldChanged: 'assigneeId',
                newValue: item.assigneeId,
                createdAt: new Date(now - 2 * oneDay),
            });
        }
        if (item.approvalStatus === 'APPROVED') {
            await Activity.create({
                workItemId: item._id,
                actorId: item.approvedBy || item.createdBy,
                action: 'APPROVED',
                fieldChanged: 'approvalStatus',
                oldValue: 'PENDING',
                newValue: 'APPROVED',
                metadata: { reason: 'Compliance audit checks verified and signoff granted' },
                createdAt: item.approvedAt || new Date(now - oneDay),
            });
        }
        if (item.status === 'BLOCKED') {
            await Activity.create({
                workItemId: item._id,
                actorId: item.assigneeId || item.createdBy,
                action: 'STATUS_CHANGED',
                fieldChanged: 'status',
                oldValue: 'IN_PROGRESS',
                newValue: 'BLOCKED',
                metadata: { reason: 'Waiting on maintenance window approval from Core Infra' },
                createdAt: new Date(now - 12 * 60 * 60 * 1000),
            });
            await Comment.create({
                workItemId: item._id,
                authorId: elena._id,
                body: 'Staging benchmark completed. Redis latency stayed under 2ms. Ready to schedule prod execution once Sarah signs off.',
            });
        }
        if (item.identifier === 'NW-1001') {
            await Comment.create({
                workItemId: item._id,
                authorId: sarah._id,
                body: 'Investigating max_connections setting on mongo router. Spikes correlate with batch order processing at 14:00 UTC.',
            });
            await Comment.create({
                workItemId: item._id,
                authorId: admin._id,
                body: 'Escalated to P1. Please keep customer operations updated on the status channel.',
            });
        }
    }
    logger.info('Seed completed successfully!');
    logger.info('----------------------------------------------------');
    logger.info('DEVELOPMENT ACCOUNTS SEEDED:');
    logger.info(`1. Admin:      ${admin.email} (Password: ${env.ADMIN_PASSWORD})`);
    logger.info(`2. Sarah Chen: ${sarah.email} (Password: Password123!) [Team Lead: Infra]`);
    logger.info(`3. Marcus:     ${marcus.email} (Password: Password123!) [Team Lead: Payments]`);
    logger.info(`4. David Kim:  ${david.email} (Password: Password123!) [Team Lead: Support]`);
    logger.info(`5. Elena:      ${elena.email} (Password: Password123!) [Member: Infra, Payments]`);
    logger.info(`6. Priya:      ${priya.email} (Password: Password123!) [Member: Support]`);
    logger.info('----------------------------------------------------');
    await disconnectDB();
    process.exit(0);
}
seed().catch((err) => {
    logger.error('Seed script encountered a fatal error', { error: err.message, stack: err.stack });
    process.exit(1);
});
