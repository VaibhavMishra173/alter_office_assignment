import mongoose, { Schema } from 'mongoose';
import type { Analytics } from '../types/index.js';

const analyticsSchema = new Schema<Analytics>(
  {
    urlId: {
      type: Schema.Types.ObjectId,
      ref: 'Url',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number],
        index: '2dsphere' // Geo spatial index for location coordinates
      }
    },
    deviceType: String,
    osType: String,
    uniqueVisitorId: String
  },
  {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  }
);

export const AnalyticsModel = mongoose.model<Analytics>('Analytics', analyticsSchema);
