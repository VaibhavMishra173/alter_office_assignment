require('dotenv').config();

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'default_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'default_google_client_secret',
  },
  server: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    port: process.env.PORT || 3000,
  },
  rateLimit: {
    window: process.env.RATE_LIMIT_WINDOW || 3600, // Time window in seconds
    max: process.env.RATE_LIMIT_MAX || 100,       // Max requests per window
  },
};
