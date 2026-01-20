import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const configureGoogleAuth = () => {
  // Only configure Google OAuth if credentials are provided
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn(
      'Google OAuth credentials not configured. Skipping Google authentication setup.'
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:8080/api/v1/auth/google/callback',
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: Express.User | false) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          const { user, token, isNewUser } =
            await authService.findOrCreateFromGoogle({
              email,
              name: profile.displayName,
              googleId: profile.id,
            });

          // Pass user data along with token and isNewUser flag
          return done(null, { ...user, token, isNewUser });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user for session (not used with JWT but required by passport)
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as { id: string }).id);
  });

  // Deserialize user (not used with JWT but required by passport)
  passport.deserializeUser(async (id: string, done) => {
    try {
      // For JWT-based auth, we don't need full deserialization
      done(null, { id });
    } catch (error) {
      done(error);
    }
  });
};

export default passport;
