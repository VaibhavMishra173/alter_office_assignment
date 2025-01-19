import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import logger from '../utils/logger';

interface IRequest extends Request {
  // FIXME:
  user?: any;
}


class AuthController {
  /**
   * Handles the Google OAuth callback and generates a JWT for the authenticated user.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  static async googleCallback(req: IRequest, res: Response): Promise<void> {
    try {

      // Generate JWT
      const token = sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      // Send the token as a response
      res.redirect(`/profile?token=${token}`);
    } catch (error) {
      logger.error('Error in Google callback:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
}

export default AuthController;
