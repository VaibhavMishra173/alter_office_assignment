import { Router } from 'express';
import { getUrlAnalytics,getTopicAnalytics,getOverallAnalytics } from '../controllers/analytics.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/url/:alias', 
  authMiddleware, 
  getUrlAnalytics
);

router.get('/topic/:topic', 
  authMiddleware, 
  getTopicAnalytics
);

router.get('/overall', 
  authMiddleware, 
  getOverallAnalytics
);

export default router;