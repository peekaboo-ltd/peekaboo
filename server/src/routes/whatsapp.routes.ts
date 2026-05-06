import { Router } from "express";
import { WhatsappController } from "../controllers/whatsapp.controller";

const router = Router();

router.get("/webhook", WhatsappController.getWebhook);

router.post("/webhook", WhatsappController.postWebhook);

router.post("/flows/order-create", WhatsappController.postOrderCreateFlow);

export default router;
