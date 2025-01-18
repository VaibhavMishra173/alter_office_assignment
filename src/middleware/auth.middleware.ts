import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import logger from '../utils/logger';

interface IRequest extends Request {
  // FIXME:
  user?: any;
}

const authMiddleware = async (req: IRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token and extract decoded data
    const decoded = verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Retrieve user by ID from the decoded token
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
