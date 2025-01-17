import { getUrlAnalytics as _getUrlAnalytics,getTopicAnalytics as _getTopicAnalytics,getOverallAnalytics as _getOverallAnalytics } from '../services/analytics.service';
import { error as _error } from '../utils/logger.js';

class AnalyticsController {
  static async getUrlAnalytics(req, res) {
    try {
      const { alias } = req.params;
      const analytics = await _getUrlAnalytics(alias);
      res.json(analytics);
    } catch (error) {
      _error('Error getting URL analytics:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getTopicAnalytics(req, res) {
    try {
      const { topic } = req.params;
      const analytics = await _getTopicAnalytics(topic, req.user.id);
      res.json(analytics);
    } catch (error) {
      _error('Error getting topic analytics:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getOverallAnalytics(req, res) {
    try {
      const analytics = await _getOverallAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      _error('Error getting overall analytics:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

export default AnalyticsController;