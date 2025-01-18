import express, { Request, Response, NextFunction, json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import authMiddleware from './middleware/auth.middleware';
import connectDB from './config/database';
import logger from './utils/logger';
// Import routes
import authRoutes from './routes/auth.routes';
import urlRoutes from './routes/url.routes';
import analyticsRoutes from './routes/analytics.routes';

// Initialize app
const app = express();

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
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api-docs', serve, setup(swaggerDocument));

// Basic routes so keeping it here
app.get('/', (req, res) => {
  res.send(`<h1>Welcome to the app!</h1><a href="/api/auth/google">Login with Google</a>`);
});

app.get('/profile', authMiddleware, (req: any, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Hello, ${req?.user?.name}</h1><p>Email: ${req?.user?.email}</p>`);
  } else {
    res.redirect('/');
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
