import express,{ json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initialize } from 'passport';
import { serve,setup } from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };

import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { info,error } from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import urlRoutes from './routes/url.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Initialize app
const app = express();

// Connect to databases
connectDB();
connectRedis();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => info(message.trim()) } }));
app.use(json());
app.use(initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api-docs', serve, setup(swaggerDocument));

// Error handling middleware
app.use((err, req, res, next) => {
  error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;