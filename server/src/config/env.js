import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/newtonite_ops'),
    JWT_SECRET: z.string().min(16).default('newtonite-super-secure-production-ready-jwt-secret-key-32chars'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
    ADMIN_EMAIL: z.string().email().default('admin@newtonite.local'),
    ADMIN_PASSWORD: z.string().min(8).default('AdminSecure123!'),
    ADMIN_NAME: z.string().default('System Administrator'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
export const env = parsed.data;
