import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = Router();

// Paypack HEAD-pings the webhook URL before delivering payloads.
router.head('/paypack', WebhookController.paypackHead);
router.post('/paypack', WebhookController.paypackWebhook);

export default router;
