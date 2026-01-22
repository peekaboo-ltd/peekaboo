import { Router } from 'express';
import { LandingController } from '../controllers/landing.controller';

const router = Router();

// Public landing stats (no auth) for marketing/landing page
router.get('/stats', LandingController.getLandingStats);

export default router;

