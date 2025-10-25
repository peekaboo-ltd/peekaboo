import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { KpayPaymentStatus, KpayWebhookPayload } from '../types/kpay.types';

const paymentService = new PaymentService();

export const WebhookController = {
  // KPAY WEBHOOK
  async kpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const rawPayloadString = Object.keys(body)?.[0];
      let raw: KpayWebhookPayload;
      try {
        raw = JSON.parse(rawPayloadString);
      } catch (e) {
        return res.status(400).json({ message: "Invalid webhook payload format" });
      }

      const { refid, statusid } = raw;
      const payment = await paymentService.updatePaymentStatus(
        refid,
        statusid as KpayPaymentStatus
      );

      return res.status(200).json({
        message: 'Payment status updated successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },
};
