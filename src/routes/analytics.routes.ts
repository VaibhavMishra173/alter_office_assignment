import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/url/:alias', 
  authMiddleware, 
  AnalyticsController.getUrlAnalytics
);

router.get('/topic/:topic', 
  authMiddleware, 
  AnalyticsController.getTopicAnalytics
);

router.get('/overall', 
  authMiddleware, 
  AnalyticsController.getOverallAnalytics
);

export default router;