import { Types } from 'mongoose';
import { AnalyticsModel } from '../models/analytics.model';
import { UrlModel } from '../models/url.model';
import redis from '../config/redis';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

interface LocationInfo {
  country: string;
  city: string;
  coordinates: [number, number];
}

interface ClicksByDate {
  date: string;
  clicks: number;
}

interface OSStats {
  osName: string;
  uniqueClicks: number;
  uniqueUsers: number;
}

interface DeviceStats {
  deviceName: string;
  uniqueClicks: number;
  uniqueUsers: number;
}

interface AnalyticsResponse {
  totalClicks: number;
  uniqueUsers: number;
  clicksByDate: ClicksByDate[];
  osType: OSStats[];
  deviceType: DeviceStats[];
}

interface TopicAnalyticsResponse extends AnalyticsResponse {
  urls: Array<{
    shortUrl: string;
    totalClicks: number;
    uniqueUsers: number;
  }>;
}

interface OverallAnalyticsResponse extends AnalyticsResponse {
  totalUrls: number;
}

class AnalyticsService {
  
  static async incrementCachedMetrics(urlId: Types.ObjectId): Promise<void> {
    // Assuming you are using Redis or a similar caching service for this
    const redisKey = `url_metrics:${urlId}`;
    const currentMetrics = await redis.get(redisKey);
    
    if (currentMetrics) {
      // Assuming you store metrics as a JSON object
      const metrics = JSON.parse(currentMetrics);
      metrics.totalClicks += 1;
      await redis.set(redisKey, JSON.stringify(metrics));
    } else {
      // If no cached data exists, initialize new metrics
      const metrics = { totalClicks: 1, uniqueUsers: 0 };
      await redis.set(redisKey, JSON.stringify(metrics));
    }
  }  

  static async trackVisit(urlId: string, req: any): Promise<void> {
    const ObjUrlId = new Types.ObjectId(urlId)
    const userAgent = req.headers['user-agent'] as string;
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    const analytics = new AnalyticsModel({
      urlId: ObjUrlId,
      userAgent,
      ipAddress: req.ip,
      deviceType: deviceInfo.device?.type || 'unknown',
      osType: deviceInfo.os?.name || 'unknown',
      uniqueVisitorId: this.generateVisitorId(req),
      location: await this.getLocationInfo(req.ip),
    });

    await analytics.save();
    await this.incrementCachedMetrics(ObjUrlId);
  }

  static generateVisitorId(req: any): string {
    return crypto
      .createHash('md5')
      .update(req.ip + req.headers['user-agent'])
      .digest('hex');
  }

  static async getLocationInfo(ip: string): Promise<LocationInfo> {
    // Placeholder for IP geolocation
    return {
      country: 'Unknown',
      city: 'Unknown',
      coordinates: [0, 0],
    };
  }

  static async getUrlAnalytics(urlId: string): Promise<AnalyticsResponse> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ObjUrlId = new Types.ObjectId(urlId)
    const pipeline = [
      { $match: { urlId: ObjUrlId, timestamp: { $gte: sevenDaysAgo } } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' },
              },
            },
          ],
          clicksByDate: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                clicks: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          osStats: [
            {
              $group: {
                _id: '$osType',
                uniqueClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' },
              },
            },
          ],
          deviceStats: [
            {
              $group: {
                _id: '$deviceType',
                uniqueClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' },
              },
            },
          ],
        },
      },
    ];

    const results = await AnalyticsModel.aggregate(pipeline as any);
    return this.formatAnalyticsResponse(results[0]);
  }

  static async getTopicAnalytics(topic: string, userId: string): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const urls = await UrlModel.find({ topic, userId });
    const urlIds = urls.map(url => url._id);

    const pipeline = [
      {
        $match: {
          urlId: { $in: urlIds },
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' }
              }
            }
          ],
          clicksByDate: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                  urlId: '$urlId'
                },
                clicks: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                totalClicks: { $sum: '$clicks' }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          urlStats: [
            {
              $group: {
                _id: '$urlId',
                clicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' }
              }
            }
          ]
        }
      }
    ];

    const results = await AnalyticsModel.aggregate(pipeline as any);
    return this.formatTopicAnalyticsResponse(results[0], urls);
  }

  static async getOverallAnalytics(userId: string): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const urls = await UrlModel.find({ userId });
    const urlIds = urls.map(url => url._id);

    const pipeline = [
      {
        $match: {
          urlId: { $in: urlIds },
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' }
              }
            }
          ],
          clicksByDate: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                clicks: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          osStats: [
            {
              $group: {
                _id: '$osType',
                uniqueClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' }
              }
            }
          ],
          deviceStats: [
            {
              $group: {
                _id: '$deviceType',
                uniqueClicks: { $sum: 1 },
                uniqueUsers: { $addToSet: '$uniqueVisitorId' }
              }
            }
          ]
        }
      }
    ];

    const results = await AnalyticsModel.aggregate(pipeline as any);
    return this.formatOverallAnalyticsResponse(results[0], urls);
  }

  static formatAnalyticsResponse(data: any): any {
    return {
      totalClicks: data.summary[0]?.totalClicks || 0,
      uniqueUsers: data.summary[0]?.uniqueUsers.length || 0,
      clicksByDate: data.clicksByDate.map((item: any) => ({
        date: item._id,
        clicks: item.clicks
      })),
      osType: data.osStats.map((item: any) => ({
        osName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      })),
      deviceType: data.deviceStats.map((item: any) => ({
        deviceName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      }))
    };
  }

  static formatTopicAnalyticsResponse(data: any, urls: any[]): any {
    return {
      totalClicks: data.summary[0]?.totalClicks || 0,
      uniqueUsers: data.summary[0]?.uniqueUsers.length || 0,
      clicksByDate: data.clicksByDate.map((item: any) => ({
        date: item._id,
        clicks: item.totalClicks
      })),
      urls: urls.map((url: any) => {
        const stats = data.urlStats.find((stat: any) =>
          stat._id.toString() === url._id.toString()
        );
        return {
          shortUrl: url.shortUrl,
          totalClicks: stats?.clicks || 0,
          uniqueUsers: stats?.uniqueUsers.length || 0
        };
      })
    };
  }

  static formatOverallAnalyticsResponse(data: any, urls: any[]): any {
    return {
      totalUrls: urls.length,
      totalClicks: data.summary[0]?.totalClicks || 0,
      uniqueUsers: data.summary[0]?.uniqueUsers.length || 0,
      clicksByDate: data.clicksByDate.map((item: any) => ({
        date: item._id,
        clicks: item.clicks
      })),
      osType: data.osStats.map((item: any) => ({
        osName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      })),
      deviceType: data.deviceStats.map((item: any) => ({
        deviceName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      }))
    };
  }
}
export default AnalyticsService;
