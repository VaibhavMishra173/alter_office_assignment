// services/analytics.service.js
import Analytics,{ aggregate } from '../models/analytics.model';
import { find } from '../models/url.model';
import redis from '../config/redis';
import { Types } from 'mongoose';

class AnalyticsService {
  static async trackVisit(urlId, req) {
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    const analytics = new Analytics({
      urlId,
      userAgent,
      ipAddress: req.ip,
      deviceType: deviceInfo.device.type || 'unknown',
      osType: deviceInfo.os.name || 'unknown',
      uniqueVisitorId: this.generateVisitorId(req),
      location: await this.getLocationInfo(req.ip)
    });

    await analytics.save();
    await this.incrementCachedMetrics(urlId);
  }

  static generateVisitorId(req) {
    return crypto
      .createHash('md5')
      .update(req.ip + req.headers['user-agent'])
      .digest('hex');
  }

  static async getLocationInfo(ip) {
    // Implement IP geolocation using a service like MaxMind or similar
    // This is a placeholder implementation
    return {
      country: 'Unknown',
      city: 'Unknown',
      coordinates: [0, 0]
    };
  }

  static async getUrlAnalytics(urlId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pipeline = [
      { $match: { 
        urlId: Types.ObjectId(urlId),
        timestamp: { $gte: sevenDaysAgo }
      }},
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

    const results = await aggregate(pipeline);
    return this.formatAnalyticsResponse(results[0]);
  }

  static async getTopicAnalytics(topic, userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const urls = await find({ topic, userId });
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

    const results = await aggregate(pipeline);
    return this.formatTopicAnalyticsResponse(results[0], urls);
  }

  static async getOverallAnalytics(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const urls = await find({ userId });
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

    const results = await aggregate(pipeline);
    return this.formatOverallAnalyticsResponse(results[0], urls);
  }

  static formatAnalyticsResponse(data) {
    return {
      totalClicks: data.summary[0]?.totalClicks || 0,
      uniqueUsers: data.summary[0]?.uniqueUsers.length || 0,
      clicksByDate: data.clicksByDate.map(item => ({
        date: item._id,
        clicks: item.clicks
      })),
      osType: data.osStats.map(item => ({
        osName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      })),
      deviceType: data.deviceStats.map(item => ({
        deviceName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      }))
    };
  }

  static formatTopicAnalyticsResponse(data, urls) {
    return {
      totalClicks: data.summary[0]?.totalClicks || 0,
      uniqueUsers: data.summary[0]?.uniqueUsers.length || 0,
      clicksByDate: data.clicksByDate.map(item => ({
        date: item._id,
        clicks: item.totalClicks
      })),
      urls: urls.map(url => {
        const stats = data.urlStats.find(stat => 
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

  static formatOverallAnalyticsResponse(data, urls) {
    return {
      totalUrls: urls.length,
      totalClicks: data.summary[0]?.totalClicks || 0,
      uniqueUsers: data.summary[0]?.uniqueUsers.length || 0,
      clicksByDate: data.clicksByDate.map(item => ({
        date: item._id,
        clicks: item.clicks
      })),
      osType: data.osStats.map(item => ({
        osName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      })),
      deviceType: data.deviceStats.map(item => ({
        deviceName: item._id,
        uniqueClicks: item.uniqueClicks,
        uniqueUsers: item.uniqueUsers.length
      }))
    };
  }
}

export default AnalyticsService;