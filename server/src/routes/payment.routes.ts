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

export default router;
