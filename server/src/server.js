import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
const startServer = async () => {
    try {
        await connectDB();
        const app = createApp();
        const server = app.listen(env.PORT, () => {
            logger.info(`Newtonite Operations server listening on port ${env.PORT}`, {
                port: env.PORT,
                env: env.NODE_ENV,
            });
        });
        const shutdown = async (signal) => {
            logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                await disconnectDB();
                logger.info('Closed out remaining connections. Exiting process.');
                process.exit(0);
            });
            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger.error('Failed to start server', { error: error.message });
        process.exit(1);
    }
};
startServer();
