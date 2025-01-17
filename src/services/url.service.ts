import { randomBytes } from 'crypto';
import { UrlModel } from '../models/url.model';
import redis from '../config/redis';

class UrlService {
  static async generateUniqueAlias(customAlias = null) {
    if (customAlias) {
      const exists = await UrlModel.findOne({ alias: customAlias });
      if (exists) {
        throw new Error('Custom alias already exists');
      }
      return customAlias;
    }

    while (true) {
      const alias = randomBytes(4).toString('hex');
      const exists = await UrlModel.findOne({ alias });
      if (!exists) return alias;
    }
  }

  static async createShortUrl(userId: string, longUrl: string, customAlias = null, topic = null) {
    const alias = await this.generateUniqueAlias(customAlias);
    const shortUrl = `${process.env.BASE_URL}/${alias}`;

    const url = new UrlModel({
      longUrl,
      shortUrl,
      alias,
      topic,
      userId
    });

    await url.save();
    await redis.set(`url:${alias}`, longUrl, 'EX', 86400); // Cache for 24 hours

    return url;
  }

  static async getLongUrl(alias: string) {
    // Try cache first
    const cachedUrl = await redis.get(`url:${alias}`);
    if (cachedUrl) return cachedUrl;

    // If not in cache, get from DB and cache it
    const url = await UrlModel.findOne({ alias });
    if (!url) return null;

    await redis.set(`url:${alias}`, url.longUrl, 'EX', 86400);
    return url.longUrl;
  }
}

export default UrlService;