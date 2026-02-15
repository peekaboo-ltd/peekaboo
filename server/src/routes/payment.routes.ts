import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

router.use(authenticate);

// Create payment
router.post(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER, RoleTypes.STAFF]),
  PaymentController.createPayment
);

// Fetch payments
router.get(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER, RoleTypes.STAFF]),
  PaymentController.fetchPayments
);

// Admin: Fetch payments with comprehensive filters
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

export default router;
