import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = Router();

// MVend payment-completed notifications. The secret token in the path
// (MVEND_CALLBACK_TOKEN) authenticates MPS, which does not sign callbacks.
router.head('/mvend/:token', WebhookController.mvendProbe);
router.get('/mvend/:token', WebhookController.mvendProbe);
router.post('/mvend/:token', WebhookController.mvendCallback);

export default router;
