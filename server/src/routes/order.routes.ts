import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();

router.patch("/:id/accept", OrderController.acceptOrder);

export default router;
