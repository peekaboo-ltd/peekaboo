import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

// Public webhook endpoint (no authentication required)
router.post('/webhook/kpay', paymentController.handleWebhook);

// Protected endpoints
router.use(authenticate);

// Create payment
router.post('/', paymentController.createPayment);

// Get payment by ID
router.get('/:id', paymentController.getPayment);

// Check payment status
router.get('/:id/status', paymentController.checkPaymentStatus);

// Get payments by entity
router.get('/entity/:entityId', paymentController.getPaymentsByEntity);

// Get payment statistics
router.get('/statistics', paymentController.getPaymentStatistics);

// Process refund (admin only)
router.post('/:id/refund', authorize(['ADMIN']), paymentController.processRefund);

export default router;