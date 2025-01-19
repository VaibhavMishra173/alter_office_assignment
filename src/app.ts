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
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserModel } from './models/user.model';

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
  res.send(`
    <h1>Welcome to the Advanced URL Shortener API!</h1>
    
    <p><strong>Overview:</strong></p>
    <p>The Advanced URL Shortener API is a scalable, containerized application for creating, managing, and analyzing short URLs. It includes features like Google Sign-In for authentication, detailed analytics, custom aliases, and rate limiting.</p>

    <h2>Features</h2>
    <ul>
      <li>User Authentication: Secure authentication via Google Sign-In.</li>
      <li>Custom Aliases: Optional custom aliases for short URLs.</li>
      <li>Detailed Analytics: Insights into total clicks, unique users, OS/device breakdown, and more.</li>
      <li>Topic-based Grouping: Group URLs under topics for easier management.</li>
      <li>Rate Limiting: Prevent abuse of API endpoints by limiting requests.</li>
      <li>Caching: Redis caching for faster access and reduced database load.</li>
      <li>Dockerized: Easily deployable using Docker.</li>
    </ul>

    <h2>Technologies Used</h2>
    <p><strong>Backend:</strong> Node.js (with TypeScript for type safety), Express.js (framework for building REST APIs)</p>
    <p><strong>Database:</strong> MongoDB (scalable, NoSQL database)</p>
    <p><strong>Caching:</strong> Redis (in-memory data structure store)</p>
    <p><strong>Authentication:</strong> Google Sign-In (secure and easy login mechanism)</p>
    <p><strong>Deployment:</strong> Docker (containerization for consistent environments), Railway.app (cloud hosting for the deployed app)</p>

    <h2>Rate Limiting Configuration</h2>
    <p>The API enforces rate limiting with the following settings:</p>
    <ul>
      <li><strong>RATE_LIMIT_WINDOW:</strong> 60 seconds (1 minute)</li>
      <li><strong>RATE_LIMIT_MAX:</strong> 100 requests per window (you can make up to 100 requests in 60 seconds)</li>
    </ul>
    <p>This is designed to prevent abuse of the API and ensure fair usage for all users.</p>
    
    <a href="/api/auth/google">Login with Google</a>
  `);
});


app.get('/profile', async (req: any, res) => {
  const token = req.query.token;  // Get token from the query string
  const decoded = verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  // Retrieve user by ID from the decoded token
  const user = await UserModel.findById(decoded.id);

  if (req.isAuthenticated()) {
    res.send(`
      <h1>Hello, ${user?.name}</h1>
      <p>Email: ${user?.email}</p>
      <p>Token: <span id="token">${token}</span></p> <!-- Display token here -->
      <button id="copyButton" onclick="copyToClipboard()">Copy</button> <!-- Button to copy token -->
      <p><a href="/api-docs">View Swagger Documentation</a></p>  <!-- Link to Swagger -->

      <script>
        function copyToClipboard() {
          const tokenText = document.getElementById('token').innerText;
          navigator.clipboard.writeText(tokenText).then(() => {
            alert('Token copied to clipboard!');
          }).catch(err => {
            alert('Failed to copy token: ' + err);
          });
        }
      </script>
    `);
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
