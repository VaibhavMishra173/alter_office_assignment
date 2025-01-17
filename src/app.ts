import express, { Application, Request, Response, NextFunction, json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initialize } from 'passport';
import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import connectDB from './config/database';
import redis from './config/redis';

import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import urlRoutes from './routes/url.routes';
import analyticsRoutes from './routes/analytics.routes';

// Initialize app
const app = express();

logger.info('Initializing')
// Connect to the databases
const connectServices = async () => {
  try {
    await connectDB(); // Ensure DB connection is established
    logger.info('Database connected successfully');

    // Redis connection is handled in its own file, you can handle events there
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Error connecting to services:', error);
    process.exit(1); // Exit the process if services cannot connect
  }
};

connectServices(); // Initialize all connections before app starts

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(json());
// app.use(initialize());

// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api-docs', serve, setup(swaggerDocument));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
