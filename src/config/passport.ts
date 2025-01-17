import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/user.model';
import logger from '../utils/logger';

// Check if environment variables are defined
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = `${process.env.BASE_URL}/api/auth/google/callback`;

if (!clientID || !clientSecret || !callbackURL) {
  throw new Error('Google OAuth credentials are not defined in the environment variables.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ensure profile.emails and profile.emails[0] exist
        const email = profile.emails?.[0]?.value;
        if (!email) {
          logger.error('Google authentication error: No email found for the user');
          return done(new Error('No email found'));
        }

        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
          user = new UserModel({
            googleId: profile.id,
            email: email,  // Safe to use email here
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || '',  // Optional chaining for photos
          });

          await user.save();
          logger.info(`New user created: ${profile.displayName} with Google ID: ${profile.id}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Google authentication error:', error);
        return done(error);
      }
    }
  )
);

export default passport;
