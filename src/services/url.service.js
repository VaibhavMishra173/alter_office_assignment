import { randomBytes } from 'crypto';
import Url,{ findOne } from '../models/url.model';
import { set,get } from '../config/redis';

class UrlService {
  static async generateUniqueAlias(customAlias = null) {
    if (customAlias) {
      const exists = await findOne({ alias: customAlias });
      if (exists) {
        throw new Error('Custom alias already exists');
      }
      return customAlias;
    }

    while (true) {
      const alias = randomBytes(4).toString('hex');
      const exists = await findOne({ alias });
      if (!exists) return alias;
    }
  }

  static async createShortUrl(userId, longUrl, customAlias = null, topic = null) {
    const alias = await this.generateUniqueAlias(customAlias);
    const shortUrl = `${process.env.BASE_URL}/${alias}`;

    const url = new Url({
      longUrl,
      shortUrl,
      alias,
      topic,
      userId
    });

    await url.save();
    await set(`url:${alias}`, longUrl, 'EX', 86400); // Cache for 24 hours

    return url;
  }

  static async getLongUrl(alias) {
    // Try cache first
    const cachedUrl = await get(`url:${alias}`);
    if (cachedUrl) return cachedUrl;

    // If not in cache, get from DB and cache it
    const url = await findOne({ alias });
    if (!url) return null;

    await set(`url:${alias}`, url.longUrl, 'EX', 86400);
    return url.longUrl;
  }
}

export default UrlService;