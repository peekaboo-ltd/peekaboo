import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = Router();

// Paypack HEAD-pings the webhook URL before delivering payloads.
router.head('/paypack', WebhookController.paypackHead);
router.post('/paypack', WebhookController.paypackWebhook);

// MVend payment-completed notifications. The secret token in the path
// (MVEND_CALLBACK_TOKEN) authenticates MPS, which does not sign callbacks.
router.head('/mvend/:token', WebhookController.mvendProbe);
router.get('/mvend/:token', WebhookController.mvendProbe);
router.post('/mvend/:token', WebhookController.mvendCallback);

export default router;
