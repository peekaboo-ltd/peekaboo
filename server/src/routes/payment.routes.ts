import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Create payment
router.post('/', PaymentController.createPayment);

// Fetch payments
router.get('/', PaymentController.fetchPayments);

// Protected endpoints
router.use(authenticate);

export default router;
