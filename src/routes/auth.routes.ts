import { Router } from 'express';
import { authenticate } from 'passport';
import AuthController  from '../controllers/auth.controller';

const router = Router();

router.get('/google',
  authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  authenticate('google', { session: false }),
  AuthController.googleCallback
);

export default router;