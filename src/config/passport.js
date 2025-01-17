import passport,{ use } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOne,create } from '../models/user.model';
import { error as _error } from '../utils/logger.js';

use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findOne({ googleId: profile.id });
        
        if (!user) {
          user = await create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value
          });
        }
        
        return done(null, user);
      } catch (error) {
        _error('Google authentication error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;