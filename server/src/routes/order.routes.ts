import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();

router.post("/", OrderController.createOrder);

router.patch("/:id", OrderController.updateOrder);

router.patch("/:id/accept", OrderController.acceptOrder);

router.post("/public", OrderController.createPublicOrder);

router.get("/:id", OrderController.getOrderById);

export default router;
