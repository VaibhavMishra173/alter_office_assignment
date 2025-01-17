import mongoose from 'mongoose';

export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  picture: string;
  createdAt: Date;
}

export interface Url {
  _id: string;
  longUrl: string;
  shortUrl: string;
  alias: string;
  topic?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface Analytics {
  _id: string;
  urlId: mongoose.Types.ObjectId;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  deviceType: string;
  osType: string;
  uniqueVisitorId: string;
}

export interface UrlAnalytics {
  totalClicks: number;
  uniqueUsers: number;
  clicksByDate: Array<{
    date: string;
    clicks: number;
  }>;
  osType: Array<{
    osName: string;
    uniqueClicks: number;
    uniqueUsers: number;
  }>;
  deviceType: Array<{
    deviceName: string;
    uniqueClicks: number;
    uniqueUsers: number;
  }>;
}

export interface TopicAnalytics extends Omit<UrlAnalytics, 'osType' | 'deviceType'> {
  urls: Array<{
    shortUrl: string;
    totalClicks: number;
    uniqueUsers: number;
  }>;
}

export interface OverallAnalytics extends UrlAnalytics {
  totalUrls: number;
}

// Custom type for Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// src/types/environment.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGODB_URI: string;
      REDIS_URL: string;
      JWT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      BASE_URL: string;
      RATE_LIMIT_WINDOW: string;
      RATE_LIMIT_MAX: string;
    }
  }
}

export {};