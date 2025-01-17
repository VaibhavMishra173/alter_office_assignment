import { Request, Response, NextFunction } from 'express';
import AnalyticsService from '../services/analytics.service';
import logger from '../utils/logger';

const trackVisit = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { urlId } = req;
    await AnalyticsService.trackVisit(urlId, req);
    next();
  } catch (error) {
    logger.error('Error tracking visit:', error);
    next(error);
  }
};

export default trackVisit;
