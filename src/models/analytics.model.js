import { Schema,model } from 'mongoose';

const analyticsSchema = new Schema({
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
      index: '2dsphere'
    }
  },
  deviceType: String,
  osType: String,
  uniqueVisitorId: String
});

export default model('User', analyticsSchema);
