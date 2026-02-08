import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET dashboard metrics
router.get('/', DashboardController.getDashboardMetrics);

// Charts
router.get('/charts/orders', DashboardController.getOrderChartData);
router.get('/charts/revenue', DashboardController.getRevenueChartData);
router.get('/charts/deliveries', DashboardController.getDeliveryChartData);
router.get('/charts/summary', DashboardController.getSummaryChartData);

// Quick order lookup
router.get('/orders/search', DashboardController.searchOrderByReferenceId);

export default router;
