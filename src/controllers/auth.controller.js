import { sign } from 'jsonwebtoken';
import { error as _error } from '../utils/logger.js';

class AuthController {
  static async googleCallback(req, res) {
    try {
      const token = sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token });
    } catch (error) {
      _error('Error in Google callback:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

export default AuthController;