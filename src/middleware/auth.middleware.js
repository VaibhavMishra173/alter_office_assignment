import { verify } from 'jsonwebtoken';
import { findById } from '../models/user.model';
import { error as _error } from '../utils/logger.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    _error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;