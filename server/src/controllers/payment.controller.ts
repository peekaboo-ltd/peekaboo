import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';

import { AuthenticatedRequest } from '../types/auth.types';
import { PaymentStatus } from '../types/payment-status.types';
import { UUID } from '../types';
import { ValidationError } from '../helpers/errors.helper';

const paymentService = new PaymentService();
const orderService = new OrderService();

export const PaymentController = {
  // CREATE PUBLIC PAYMENT (no auth, uses order's senderId as creator)
  async createPublicPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const { orderId } = body;

      if (!orderId) {
        throw new ValidationError('orderId is required for public payments');
      }

      // Verify order exists and get senderId for attribution
      const order = await orderService.getOrderById(orderId as UUID);

      const result = await paymentService.createPayment({
        ...body,
        createdById: order.senderId,
      });

      if (result) {
        return res.status(201).json({
          success: true,
          message: 'Payment created successfully',
          data: result,
          paymentUrl:
            result.paymentUrl ||
            result.metadata?.paymentUrl ||
            result.metadata?.hostedCheckoutUrl ||
            result.metadata?.cardProcessingUrl ||
            result.externalReferenceId,
        });
      }
    } catch (error: any) {
      next(error);
    }
  },

  // FETCH PUBLIC PAYMENTS (no auth, requires entityId query param)
  async fetchPublicPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;

      if (!query.entityId) {
        throw new ValidationError('entityId query parameter is required');
      }

      const payments = await paymentService.fetchPayments(query);
      return res.status(200).json({
        message: 'Payments fetched successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublicPaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { paymentId } = req.params;
      const { entityId } = req.query;

      if (!entityId) {
        throw new ValidationError('entityId query parameter is required');
      }

      const payment = await paymentService.getPublicPaymentStatus(
        paymentId as UUID,
        entityId as UUID,
      );

      return res.status(200).json({
        message: 'Payment status fetched successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new payment
   */
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const { body } = req;

      const result = await paymentService.createPayment({
        ...body,
        createdById: user?.id,
      });

      if (result) {
        return res.status(201).json({
          success: true,
          message: 'Payment created successfully',
          data: result,
          paymentUrl:
            result.paymentUrl ||
            result.metadata?.paymentUrl ||
            result.metadata?.hostedCheckoutUrl ||
            result.metadata?.cardProcessingUrl ||
            result.externalReferenceId,
        });
      }
    } catch (error: any) {
      next(error);
    }
  },

  // FETCH PAYMENTS
  async fetchPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const payments = await paymentService.fetchPayments(query);
      return res.status(200).json({
        message: 'Payments fetched successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET PAYMENT BY ID
  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id as UUID);
      return res.status(200).json({
        message: 'Payment fetched successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADMIN: FETCH PAYMENTS WITH COMPREHENSIVE FILTERS
  async fetchAdminPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const payments = await paymentService.fetchAdminPayments(query);
      return res.status(200).json({
        message: 'Payments fetched successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADMIN: GET PAYMENT STATS
  async getPaymentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const stats = await paymentService.getPaymentStats(query);
      return res.status(200).json({
        message: 'Payment stats fetched successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADMIN: UPDATE PAYMENT STATUS
  async adminUpdatePaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const payment = await paymentService.adminUpdatePaymentStatus(
        id as UUID,
        status as PaymentStatus,
      );
      return res.status(200).json({
        message: 'Payment status updated successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADMIN: REFUND (rollback reverses the debit; credit pays the payer back)
  async adminRefundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { method, amount } = req.body || {};
      if (method !== 'rollback' && method !== 'credit') {
        throw new ValidationError("method must be 'rollback' or 'credit'");
      }
      const parsedAmount =
        amount === undefined || amount === null || amount === '' ? undefined : Number(amount);
      if (parsedAmount !== undefined && !Number.isFinite(parsedAmount)) {
        throw new ValidationError('amount must be a number');
      }
      const payment = await paymentService.refundMvendPayment(id as UUID, {
        method,
        amount: parsedAmount,
        requestedById: (req as AuthenticatedRequest).user?.id as UUID | undefined,
      });
      return res.status(200).json({
        message: 'Refund requested successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADMIN: MVEND MERCHANT BALANCE
  async getProviderBalance(_req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await paymentService.getMvendAccountBalance();
      return res.status(200).json({
        message: 'Balance fetched successfully',
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADMIN: EXPORT PAYMENTS
  async exportPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const payments = await paymentService.exportPayments(query);
      return res.status(200).json({
        message: 'Payments exported successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },
};
