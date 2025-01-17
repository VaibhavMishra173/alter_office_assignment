import { Router } from 'express';
import { authenticate } from 'passport';
import { googleCallback } from '../controllers/auth.controller';

const router = Router();

router.get('/google',
  authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  authenticate('google', { session: false }),
  googleCallback
);

export default router;