import Redis from 'ioredis';
import { info,error as _error } from '../utils/logger.js';

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  info('Redis connected successfully');
});

redis.on('error', (error) => {
  _error('Redis connection error:', error);
});

export default redis;