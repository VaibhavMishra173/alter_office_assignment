import { Request, Response, NextFunction } from 'express';
import AnalyticsService from '../services/analytics.service';
import UrlService from '../services/url.service';

import logger from '../utils/logger';

const trackVisit = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const urlObj = await UrlService.getUrlByAlias(req.params.alias);
    await AnalyticsService.trackVisit(urlObj._id, req);
    next();
  } catch (error) {
    logger.error('Error tracking visit:', error);
    next(error);
  }
};

export default trackVisit;
