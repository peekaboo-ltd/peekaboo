import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { KpayPaymentStatus, KpayWebhookPayload } from '../types/kpay.types';
import { UrubutoService } from '../integrations/urubuto/urubuto.service';
import {
  UrubutoPaymentWebhookPayload,
  UrubutoWebhookAuthRequest,
} from '../types/urubuto.types';
import { Payment } from '../entities/payment.entity';
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

const parseKpayWebhookBody = (
  body: Record<string, unknown>,
): KpayWebhookPayload | null => {
  const rawPayloadString = Object.keys(body)?.[0];
  if (!rawPayloadString) return null;

  try {
    return JSON.parse(rawPayloadString) as KpayWebhookPayload;
  } catch {
    return null;
  }
};

const buildUrubutoWebhookSuccessResponse = (
  payment: Payment,
  payload: UrubutoPaymentWebhookPayload,
) => ({
  status: 200,
  message: 'Successful',
  timestamp: urubutoService.timestamp(),
  data: {
    internal_transaction_id: payment.id,
    external_transaction_id:
      payment.externalReferenceId || payload.transaction_id,
    payer_phone_number: payment.customerPhone || '',
    payer_email: payment.customerEmail || '',
  },
});

const handleUrubutoWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
  source: 'callback' | 'notification' | 'reversal',
) => {
  try {
    if (!assertUrubutoToken(req, res)) return;

    const payload = req.body as UrubutoPaymentWebhookPayload;

    logger.info(`UrubutoPay payment ${source} request`, {
      transactionId:
        payload.transaction_id || payload.internal_transaction_id,
      transactionStatus: payload.transaction_status,
      payerCode: payload.payer_code,
      paymentChannelName: payload.payment_channel_name,
    });

    const payment = await paymentService.processUrubutoPaymentWebhook(
      payload,
      source,
    );

    logger.info(`UrubutoPay payment ${source} response`, {
      paymentId: payment.id,
      status: payment.status,
      externalReferenceId: payment.externalReferenceId,
    });

    return res
      .status(200)
      .json(buildUrubutoWebhookSuccessResponse(payment, payload));
  } catch (error) {
    next(error);
  }
};

export const WebhookController = {
  // KPAY WEBHOOK
  async kpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = parseKpayWebhookBody(req.body);
      if (!raw) {
        return res.status(400).json({ message: 'Invalid webhook payload format' });
      }

      const { refid, statusid } = raw;
      const payment = await paymentService.updatePaymentStatus(
        refid,
        statusid as KpayPaymentStatus,
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
        payerCode: req.body?.payer_code,
        currency: req.body?.currency,
      });

      const data = await paymentService.validateUrubutoPayer(req.body);

      logger.info('UrubutoPay payer validation response', {
        payerCode: data.payer_code,
        amount: data.amount,
        currency: data.currency,
      });

      return res.status(200).json({
        status: 200,
        message: 'validated successfully',
        timestamp: urubutoService.timestamp(),
        data,
      });
    } catch (error: any) {
      logger.error('UrubutoPay payer validation failed', {
        payerCode: req.body?.payer_code,
        statusCode: error.statusCode,
        message: error.message,
      });

      return res.status(error.statusCode || 404).json({
        status: error.statusCode || 404,
        message: error.message || 'no data found for the given payer code',
        timestamp: urubutoService.timestamp(),
      });
    }
  },

  async urubutoCallback(req: Request, res: Response, next: NextFunction) {
    return handleUrubutoWebhook(req, res, next, 'callback');
  },

  async urubutoNotification(req: Request, res: Response, next: NextFunction) {
    return handleUrubutoWebhook(req, res, next, 'notification');
  },

  async urubutoReversal(req: Request, res: Response, next: NextFunction) {
    return handleUrubutoWebhook(req, res, next, 'reversal');
  },
};
