import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaypackService } from '../integrations/paypack/paypack.service';
import { PaypackWebhookPayload } from '../types/paypack.types';
import logger from '../helpers/logger.helper';
import { buildMvendConfig } from '../integrations/mvend/mvend.config';
import { isValidCallbackToken } from '../integrations/mvend/mvend.callback';

const paymentService = new PaymentService();
const paypackService = new PaypackService();
const mvendConfig = buildMvendConfig();

type RawBodyRequest = Request & { rawBody?: Buffer };

const signatureHeader = (req: Request): string | undefined => {
  const value = req.headers['x-paypack-signature'];
  return Array.isArray(value) ? value[0] : value;
};

const hasValidMvendToken = (req: Request): boolean =>
  isValidCallbackToken(req.params.token as string | undefined, mvendConfig.callbackToken);

export const WebhookController = {
  // Reachability probe (HEAD/GET) for the MPS callback URL.
  async mvendProbe(req: Request, res: Response) {
    if (!hasValidMvendToken(req)) return res.status(404).end();
    return res.status(200).end();
  },

  // MVEND PAYMENT-COMPLETED NOTIFICATION
  // Authenticated by the secret token in the URL. Always answers 200 once
  // authenticated: the body is only a trigger, the reconciliation cron
  // covers anything that fails here, and non-2xx would invite retry storms.
  async mvendCallback(req: Request, res: Response) {
    if (!hasValidMvendToken(req)) {
      logger.error('MVend callback rejected: invalid token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = {
      ...(req.query as Record<string, any>),
      ...(req.body && typeof req.body === 'object' ? req.body : {}),
    };
    // Log the shape, not the body: it may carry payer phone numbers.
    logger.info('MVend callback received', { fields: Object.keys(payload) });

    try {
      const { payment, outcome } = await paymentService.processMvendCallback(payload);
      logger.info('MVend callback processed', {
        paymentId: payment.id,
        status: payment.status,
        outcome,
        externalReferenceId: payment.externalReferenceId,
      });
    } catch (error: any) {
      logger.error('MVend callback processing failed; leaving it to reconciliation', {
        message: error?.message,
      });
    }

    return res.status(200).json({ received: true });
  },

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
