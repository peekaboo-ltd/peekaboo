import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// PUBLIC ROUTES
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// GOOGLE OAUTH ROUTES
// Initiate Google OAuth - redirect to Google login page
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth callback - handle response from Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: process.env.FRONTEND_AUTH_FAILURE_URL || '/auth/login?error=google_auth_failed',
  }),
  AuthController.googleAuthCallback
);

// PROTECTED ROUTES
router.use(authenticate);
router.get('/me', AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.patch('/add-phone', AuthController.addPhoneNumber);

export default router;
