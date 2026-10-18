import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/errors.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import workItemRoutes from './routes/workItemRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
export const createApp = () => {
    const app = express();
    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(cors({
        origin: env.CLIENT_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    }));
    // Body parsing and cookies
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    app.use(cookieParser());
    // Rate limiting for auth endpoints (disabled in test)
    if (env.NODE_ENV !== 'test') {
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many authentication attempts. Please try again later.',
                },
            },
        });
        app.use('/api/auth/login', authLimiter);
    }
    // Health check endpoint
    app.get('/api/health', (_req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
        });
    });
    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/teams', teamRoutes);
    app.use('/api/work-items', workItemRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/notifications', notificationRoutes);
    // 404 for unmatched routes
    app.use((req, _res, next) => {
        next(AppError.notFound('Route', req.originalUrl));
    });
    // Centralized Error Handler
    app.use(errorHandler);
    return app;
};
