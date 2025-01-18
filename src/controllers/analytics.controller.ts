import { Request, Response } from 'express';
import AnalyticsService from '../services/analytics.service';
import logger from '../utils/logger';
import UrlService from '../services/url.service';

class AnalyticsController {
  /**
   * Fetches analytics for a specific URL alias.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  static async getUrlAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { alias } = req.params;
      logger.info(`Fetching analytics for URL alias: ${alias}`);
      const urlObj = await UrlService.getUrlByAlias(alias);
      const { urlId } = urlObj._id;
      const analytics = await AnalyticsService.getUrlAnalytics(urlId);
      res.json(analytics);
    } catch (error) {
      logger.error('Error getting URL analytics:', error);
      res.status(500).json({ message: 'Failed to retrieve URL analytics.' });
    }
  }

  /**
   * Fetches analytics for a specific topic.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  static async getTopicAnalytics(req: any, res: Response): Promise<void> {
    try {
      const { topic } = req.params;
      logger.info(`Fetching analytics for topic: ${topic}`);
      const analytics = await AnalyticsService.getTopicAnalytics(topic, req.user.id);
      res.json(analytics);
    } catch (error) {
      logger.error('Error getting topic analytics:', error);
      res.status(500).json({ message: 'Failed to retrieve topic analytics.' });
    }
  }

  /**
   * Fetches overall analytics for the authenticated user.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  static async getOverallAnalytics(req: any, res: Response): Promise<void> {
    try {
      logger.info('Fetching overall analytics');
      const analytics = await AnalyticsService.getOverallAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      logger.error('Error getting overall analytics:', error);
      res.status(500).json({ message: 'Failed to retrieve overall analytics.' });
    }
  }
}

export default AnalyticsController;
