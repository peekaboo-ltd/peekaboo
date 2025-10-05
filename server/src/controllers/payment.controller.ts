import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { CreatePaymentDto, PaymentQueryParams } from '../types/payment.types';
import { KpayWebhookPayload } from '../types/kpay.types';
import { UUID } from '../types';

export class PaymentController {
  /**
   * Create a new payment
   */
  async createPayment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const paymentData: CreatePaymentDto = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await paymentService.createPayment({
        ...paymentData,
        userId
      });

      if (result.success) {
        return res.status(201).json({
          success: true,
          payment: result.payment,
          paymentUrl: result.paymentUrl
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      return res.status(500).json({
        error: 'Failed to create payment',
        message: error.message
      });
    }
  }

  /**
   * Handle Kpay webhook
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const payload: KpayWebhookPayload = req.body;

      // Process webhook
      const result = await paymentService.handleKpayWebhook(payload);

      if (result.success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error: any) {
      console.error('Webhook handling error:', error);
      return res.status(500).json({
        error: 'Failed to process webhook',
        message: error.message
      });
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(req: Request, res: Response) {
    try {
      const paymentId = req.params.id as UUID;
      
      const payment = await paymentService.getPaymentById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.json({
        success: true,
        payment
      });
    } catch (error: any) {
      console.error('Get payment error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve payment',
        message: error.message
      });
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(req: Request, res: Response) {
    try {
      const paymentId = req.params.id as UUID;
      
      const result = await paymentService.checkPaymentStatus(paymentId);
      
      return res.json({
        success: true,
        payment: result.payment,
        updated: result.updated
      });
    } catch (error: any) {
      console.error('Payment status check error:', error);
      return res.status(500).json({
        error: 'Failed to check payment status',
        message: error.message
      });
    }
  }

  /**
   * Get payments by entity
   */
  async getPaymentsByEntity(req: Request, res: Response) {
    try {
      const entityId = req.params.entityId as UUID;
      const { type } = req.query as PaymentQueryParams;

      const payments = await paymentService.getPaymentsByEntity(entityId, type);

      return res.json({
        success: true,
        payments,
        total: payments.length
      });
    } catch (error: any) {
      console.error('Get payments error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve payments',
        message: error.message
      });
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(req: Request, res: Response) {
    try {
      const params: PaymentQueryParams = req.query;

      const statistics = await paymentService.getPaymentStatistics({
        entityId: params.entityId,
        type: params.type,
        startDate: params.startDate ? new Date(params.startDate) : undefined,
        endDate: params.endDate ? new Date(params.endDate) : undefined
      });

      return res.json({
        success: true,
        statistics
      });
    } catch (error: any) {
      console.error('Get statistics error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve payment statistics',
        message: error.message
      });
    }
  }

  /**
   * Process refund
   */
  async processRefund(req: Request, res: Response) {
    try {
      const paymentId = req.params.id as UUID;
      const { amount, reason } = req.body;

      const result = await paymentService.processRefund(paymentId, amount, reason);

      if (result.success) {
        return res.json({
          success: true,
          payment: result.payment,
          refund: result.refund
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('Refund processing error:', error);
      return res.status(500).json({
        error: 'Failed to process refund',
        message: error.message
      });
    }
  }
}

export const paymentController = new PaymentController();