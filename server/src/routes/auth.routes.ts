import { Router, RequestHandler } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// PUBLIC ROUTES
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

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
    failureRedirect: process.env.FRONTEND_AUTH_FAILURE_URL || 'http://localhost:5173/auth/login?error=google_auth_failed',
  }),
  AuthController.googleAuthCallback
);

// PROTECTED ROUTES
router.use(authenticate);
router.get('/me', AuthController.getCurrentUser as RequestHandler);
router.post('/logout', AuthController.logout as RequestHandler);
router.post('/refresh', AuthController.refreshToken as RequestHandler);
router.patch('/add-phone', AuthController.addPhoneNumber as RequestHandler);
router.get('/check-account', AuthController.checkAccount as RequestHandler);
router.post('/complete-account', AuthController.completeAccount as RequestHandler);
router.patch('/change-password', AuthController.changePassword as RequestHandler);

export default router;
