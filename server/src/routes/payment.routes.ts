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
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS]),
  PaymentController.createPayment
);

// Fetch payments
router.get(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  PaymentController.fetchPayments
);

export default router;
