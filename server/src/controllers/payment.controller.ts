import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

import { AuthenticatedRequest } from '../types/auth.types';
import { KpayPaymentStatus } from '../types/kpay.types';
import { UUID } from '../types';

const paymentService = new PaymentService();

export const PaymentController = {
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
          paymentUrl: result.externalReferenceId,
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
        status as KpayPaymentStatus,
      );
      return res.status(200).json({
        message: 'Payment status updated successfully',
        data: payment,
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
