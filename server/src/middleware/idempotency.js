import crypto from 'crypto';
import { IdempotencyRecord } from '../models/IdempotencyRecord.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export const handleIdempotency = async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) {
        return next();
    }
    if (!req.user) {
        return next(AppError.unauthorized('Authentication required to use idempotency keys'));
    }
    try {
        const rawPayload = JSON.stringify(req.body || {});
        const requestFingerprint = crypto
            .createHash('sha256')
            .update(`${req.method}:${req.baseUrl + req.path}:${rawPayload}`)
            .digest('hex');
        const existing = await IdempotencyRecord.findOne({
            key,
            userId: req.user.id,
        });
        if (existing) {
            if (existing.requestFingerprint !== requestFingerprint) {
                return next(AppError.conflict('Idempotency key has already been used with a different request payload or endpoint'));
            }
            logger.info('Idempotent request served from store', {
                key,
                userId: req.user.id,
                resourceId: existing.resourceId,
            });
            res.setHeader('X-Idempotent-Replay', 'true');
            res.status(existing.responseStatus).json(existing.responseBody);
            return;
        }
        // Intercept json send to record outcome
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Only cache successful or client-side non-fatal outcomes
            if (res.statusCode >= 200 && res.statusCode < 500) {
                const resourceId = body?.data?._id || body?.data?.id || body?._id || null;
                IdempotencyRecord.create({
                    key,
                    userId: req.user.id,
                    requestFingerprint,
                    resourceId: resourceId ? resourceId.toString() : null,
                    responseStatus: res.statusCode,
                    responseBody: body,
                }).catch((err) => {
                    logger.error('Failed to store idempotency record', { error: err.message, key });
                });
            }
            return originalJson(body);
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
