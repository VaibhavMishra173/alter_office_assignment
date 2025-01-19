import Redis from 'ioredis';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

// Create a Redis client instance using the redis URL
const redis = new Redis(process.env.REDIS_URL + '?family=0');

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('Redis client is ready');
});

redis.on('end', () => {
  logger.info('Redis connection ended');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

export default redis;
