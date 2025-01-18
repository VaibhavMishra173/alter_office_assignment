import { Router } from 'express';
import passport from '../config/passport';
import AuthController  from '../controllers/auth.controller';

const router = Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  AuthController.googleCallback
);

export default router;