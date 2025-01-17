import { Router } from 'express';
import { createShortUrl,redirectToLongUrl } from '../controllers/url.controller';
import authMiddleware from '../middleware/auth.middleware';
import rateLimitMiddleware from '../middleware/rateLimit.middleware';
import { trackVisit } from '../middleware/analytics.middleware';

const router = Router();

router.post('/shorten', 
  authMiddleware, 
  rateLimitMiddleware, 
  createShortUrl
);

router.get('/:alias', 
  trackVisit, 
  redirectToLongUrl
);

export default router;