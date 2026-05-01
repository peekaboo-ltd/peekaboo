import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = Router();

router.post('/kpay', WebhookController.kpayWebhook);
router.post('/urubuto/auth', WebhookController.urubutoAuth);
router.post('/urubuto/validation', WebhookController.urubutoValidation);
router.post('/urubuto/callback', WebhookController.urubutoCallback);
router.post('/urubuto/notification', WebhookController.urubutoNotification);
router.post('/urubuto/reversal', WebhookController.urubutoReversal);

export default router;
