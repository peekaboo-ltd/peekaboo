import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadProblemReportEvidence } from '../middlewares/upload.middleware';

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
router.post('/report-problem', uploadProblemReportEvidence, DashboardController.reportProblem);

// Business reports
router.get('/business-report', DashboardController.getBusinessReport);
router.get('/business-report/download', DashboardController.downloadBusinessReport);
router.post('/business-report/email', DashboardController.emailBusinessReport);

export default router;
