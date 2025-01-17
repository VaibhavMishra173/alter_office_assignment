import { Request, Response } from 'express';
import UrlService from '../services/url.service';
import logger from '../utils/logger';

interface IRequest extends Request {
  // FIXME:
  user?: any;
}

class UrlController {
  static async createShortUrl(req: IRequest, res: Response) {
    try {
      const { longUrl, customAlias, topic } = req.body;
      const url = await UrlService.createShortUrl(req.user.id, longUrl, customAlias, topic);
      res.status(201).json(url);
    } catch (error: any) {
      logger.error('Error creating short URL:', error);
      res.status(400).json({ message: error.message });
    }
  }

  static async redirectToLongUrl(req: Request, res: Response) {
    try {
      const { alias } = req.params;
      const longUrl = await UrlService.getLongUrl(alias);
      if (!longUrl) {
        return res.status(404).json({ message: 'URL not found' });
      }
      res.redirect(longUrl);
    } catch (error: any) {
      logger.error('Error redirecting to long URL:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

export default UrlController;