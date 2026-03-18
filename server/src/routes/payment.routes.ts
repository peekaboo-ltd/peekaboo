import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

// Public payment endpoints (no auth, scoped by order/entity ID)
router.post('/public', PaymentController.createPublicPayment);
router.get('/public', PaymentController.fetchPublicPayments);

router.use(authenticate);

// Create payment
router.post(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER, RoleTypes.STAFF, RoleTypes.GUEST]),
  PaymentController.createPayment
);

// Fetch payments
router.get(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER, RoleTypes.STAFF, RoleTypes.GUEST]),
  PaymentController.fetchPayments
);

// Admin: Fetch payments with comprehensive filters (must be before /:id)
router.get(
  '/admin',
  authorize([RoleTypes.ADMIN]),
  PaymentController.fetchAdminPayments
);

// Admin: Get payment stats
router.get(
  '/admin/stats',
  authorize([RoleTypes.ADMIN]),
  PaymentController.getPaymentStats
);

// Admin: Export payments
router.get(
  '/admin/export',
  authorize([RoleTypes.ADMIN]),
  PaymentController.exportPayments
);

// Admin: Update payment status
router.patch(
  '/admin/:id/status',
  authorize([RoleTypes.ADMIN]),
  PaymentController.adminUpdatePaymentStatus
);

// Get payment by id (after /admin routes so "admin" is not matched as id)
router.get(
  '/:id',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER, RoleTypes.STAFF, RoleTypes.GUEST]),
  PaymentController.getPaymentById
);

export default router;
