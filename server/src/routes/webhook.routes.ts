import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = Router();

router.post('/kpay', WebhookController.kpayWebhook);

export default router;
