import { Router } from 'express';
import UrlController from '../controllers/url.controller';
import authMiddleware from '../middleware/auth.middleware';
import rateLimitMiddleware from '../middleware/rateLimit.middleware';
import  trackVisit from '../middleware/analytics.middleware';

const router = Router();

router.post('/shorten', 
  authMiddleware, 
  rateLimitMiddleware, 
  UrlController.createShortUrl
);

router.get('/:alias', 
  trackVisit, 
  UrlController.redirectToLongUrl
);

export default router;