import { incr,expire } from '../config/redis';
import { error as _error } from '../utils/logger.js';

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const key = `rateLimit:${req.user.id}`;
    const limit = parseInt(process.env.RATE_LIMIT_MAX);
    const window = parseInt(process.env.RATE_LIMIT_WINDOW);

    const current = await incr(key);
    if (current === 1) {
      await expire(key, window);
    }

    if (current > limit) {
      return res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    next();
  } catch (error) {
    _error('Rate limiting error:', error);
    next(error);
  }
};

export default rateLimitMiddleware;