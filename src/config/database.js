import { connect } from 'mongoose';
import { logger as _error } from '../utils/logger';

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    info('MongoDB connected successfully');
  } catch (error) {
    _error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default { connectDB };