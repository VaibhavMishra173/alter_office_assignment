import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import logger from '../utils/logger';

interface IRequest extends Request {
  // FIXME:
  user?: any;
}


const rateLimitMiddleware = async (req: IRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Define the rate limit key based on the user ID
    const key = `rateLimit:${req.user?.id}`;
    if (!key || !req.user?.id) {
      return res.status(400).json({ message: 'User ID is required for rate limiting.' });
    }

    // Retrieve rate limit configurations
    const limit = parseInt(process.env.RATE_LIMIT_MAX || '100');  // Default to 100 if not provided
    const window = parseInt(process.env.RATE_LIMIT_WINDOW || '60'); // Default to 60 seconds if not provided

    // Increment the count for the user's rate limit
    const current = await redis.incr(key);
    if (current === 1) {
      // Set the expiration time for the rate limit key (window period)
      await redis.expire(key, window);
    }

    // Check if the current request count exceeds the rate limit
    if (current > limit) {
      return res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Proceed to the next middleware if rate limit is not exceeded
    next();
  } catch (error) {
    // Log any errors and pass the error to the next middleware
    logger.error('Rate limiting error:', error);
    next(error);
  }
};

export default rateLimitMiddleware;
