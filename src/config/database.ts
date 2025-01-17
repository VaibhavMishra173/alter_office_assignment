import dotenv from 'dotenv';
import { connect } from 'mongoose';
import logger from '../utils/logger';

dotenv.config();

const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || '';
    if (!connectionString) {
      logger.error('MongoDB URI is not defined in environment variables');
      process.exit(1);
    }

    await connect(connectionString);

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
