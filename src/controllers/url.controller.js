import { createShortUrl as _createShortUrl,getLongUrl } from '../services/url.service';
import { error as _error } from '../utils/logger.js';

class UrlController {
  static async createShortUrl(req, res) {
    try {
      const { longUrl, customAlias, topic } = req.body;
      const url = await _createShortUrl(req.user.id, longUrl, customAlias, topic);
      res.status(201).json(url);
    } catch (error) {
      _error('Error creating short URL:', error);
      res.status(400).json({ message: error.message });
    }
  }

  static async redirectToLongUrl(req, res) {
    try {
      const { alias } = req.params;
      const longUrl = await getLongUrl(alias);
      if (!longUrl) {
        return res.status(404).json({ message: 'URL not found' });
      }
      res.redirect(longUrl);
    } catch (error) {
      _error('Error redirecting to long URL:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

export default UrlController;