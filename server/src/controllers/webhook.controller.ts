import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaypackService } from '../integrations/paypack/paypack.service';
import { PaypackWebhookPayload } from '../types/paypack.types';
import logger from '../helpers/logger.helper';

const paymentService = new PaymentService();
const paypackService = new PaypackService();

type RawBodyRequest = Request & { rawBody?: Buffer };

const signatureHeader = (req: Request): string | undefined => {
  const value = req.headers['x-paypack-signature'];
  return Array.isArray(value) ? value[0] : value;
};

export const WebhookController = {
  // Paypack pings the webhook URL with HEAD before delivering payloads, so
  // this must answer 200 or no webhook is ever sent.
  async paypackHead(_req: Request, res: Response) {
    return res.status(200).end();
  },

  // PAYPACK WEBHOOK (transaction:processed)
  async paypackWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const rawBody =
        (req as RawBodyRequest).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
      if (!paypackService.verifyWebhookSignature(rawBody, signatureHeader(req))) {
        logger.error('Paypack webhook signature verification failed');
        return res.status(401).json({ message: 'Invalid webhook signature' });
      }

      const payload = req.body as PaypackWebhookPayload;
      logger.info('Paypack webhook received', {
        eventId: payload.event_id,
        kind: payload.kind,
        ref: payload.data?.ref,
        status: payload.data?.status,
      });

      const payment = await paymentService.processPaypackWebhook(payload);

      logger.info('Paypack webhook processed', {
        paymentId: payment.id,
        status: payment.status,
        externalReferenceId: payment.externalReferenceId,
      });

      return res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  },
};
