import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { KpayPaymentStatus, KpayWebhookPayload } from '../types/kpay.types';
import { UrubutoService } from '../integrations/urubuto/urubuto.service';
import {
  UrubutoPaymentWebhookPayload,
  UrubutoWebhookAuthRequest,
} from '../types/urubuto.types';
import logger from '../helpers/logger.helper';

const paymentService = new PaymentService();
const urubutoService = new UrubutoService();

const unauthorizedUrubutoResponse = (res: Response) =>
  res.status(401).json({
    timestamp: urubutoService.timestamp(),
    message: 'Invalid or missing authorization token',
    status: 401,
  });

const assertUrubutoToken = (req: Request, res: Response): boolean => {
  const valid = urubutoService.verifyWebhookToken(req.headers.authorization);
  if (!valid) unauthorizedUrubutoResponse(res);
  return valid;
};

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

  // URUBUTOPAY WEBHOOK AUTH
  async urubutoAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const result = urubutoService.authenticateWebhook(
        req.body as UrubutoWebhookAuthRequest,
      );

      if (!result.success) {
        return res.status(401).json({
          timestamp: urubutoService.timestamp(),
          message: 'Invalid credentials',
          status: 401,
        });
      }

      return res.status(200).json({
        timestamp: urubutoService.timestamp(),
        message: 'Successful',
        status: 200,
        data: {
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // URUBUTOPAY PAYER VALIDATION
  async urubutoValidation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!assertUrubutoToken(req, res)) return;

      logger.info('UrubutoPay payer validation request', {
        request: req.body,
      });

      const data = await paymentService.validateUrubutoPayer(req.body);

      logger.info('UrubutoPay payer validation response', {
        response: data,
      });

      return res.status(200).json({
        status: 200,
        message: 'validated successfully',
        timestamp: urubutoService.timestamp(),
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 404).json({
        status: error.statusCode || 404,
        message: error.message || 'no data found for the given payer code',
        timestamp: urubutoService.timestamp(),
      });
    }
  },

  // URUBUTOPAY PAYMENT CALLBACK
  async urubutoCallback(req: Request, res: Response, next: NextFunction) {
    try {
      if (!assertUrubutoToken(req, res)) return;

      logger.info('UrubutoPay payment callback request', {
        request: req.body,
      });

      const payment = await paymentService.processUrubutoPaymentWebhook(
        req.body as UrubutoPaymentWebhookPayload,
        'callback',
      );

      logger.info('UrubutoPay payment callback response', {
        response: payment,
      });

      return res.status(200).json({
        status: 200,
        message: 'Successful',
        timestamp: urubutoService.timestamp(),
        data: {
          internal_transaction_id: payment.id,
          external_transaction_id:
            payment.externalReferenceId ||
            (req.body as UrubutoPaymentWebhookPayload).transaction_id,
          payer_phone_number: payment.customerPhone || '',
          payer_email: payment.customerEmail || '',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // URUBUTOPAY PAYMENT NOTIFICATION
  async urubutoNotification(req: Request, res: Response, next: NextFunction) {
    try {
      if (!assertUrubutoToken(req, res)) return;

      logger.info('UrubutoPay payment notification request', {
        request: req.body,
      });

      const payment = await paymentService.processUrubutoPaymentWebhook(
        req.body as UrubutoPaymentWebhookPayload,
        'notification',
      );

      logger.info('UrubutoPay payment notification response', {
        response: payment,
      });

      return res.status(200).json({
        status: 200,
        message: 'Successful',
        timestamp: urubutoService.timestamp(),
        data: {
          internal_transaction_id: payment.id,
          external_transaction_id:
            payment.externalReferenceId ||
            (req.body as UrubutoPaymentWebhookPayload).transaction_id,
          payer_phone_number: payment.customerPhone || '',
          payer_email: payment.customerEmail || '',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // URUBUTOPAY PAYMENT REVERSAL
  async urubutoReversal(req: Request, res: Response, next: NextFunction) {
    try {
      if (!assertUrubutoToken(req, res)) return;

      logger.info('UrubutoPay payment reversal request', {
        request: req.body,
      });

      const payment = await paymentService.processUrubutoPaymentWebhook(
        req.body as UrubutoPaymentWebhookPayload,
        'reversal',
      );

      logger.info('UrubutoPay payment reversal response', {
        response: payment,
      });

      return res.status(200).json({
        status: 200,
        message: 'Successful',
        timestamp: urubutoService.timestamp(),
        data: {
          internal_transaction_id: payment.id,
          external_transaction_id:
            payment.externalReferenceId ||
            (req.body as UrubutoPaymentWebhookPayload).transaction_id,
          payer_phone_number: payment.customerPhone || '',
          payer_email: payment.customerEmail || '',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
