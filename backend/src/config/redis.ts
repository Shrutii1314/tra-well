import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl, {
    // Enables TLS/SSL required for cloud providers like Upstash (rediss://)
    tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
    console.log('⚡ Connected to Cloud Redis successfully!');
});

redis.on('error', (err: Error) => {
    console.error('❌ Redis Connection Error:', err.message);
});