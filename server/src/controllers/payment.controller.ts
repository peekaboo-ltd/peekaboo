import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

import { AuthenticatedRequest } from '../types/auth.types';

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
};
