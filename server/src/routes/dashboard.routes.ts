import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET dashboard metrics
router.get('/', DashboardController.getDashboardMetrics);

export default router;
