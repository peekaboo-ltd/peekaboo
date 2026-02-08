import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { RoleTypes } from "../constants/role.constants";

const router = Router();

// Public order endpoints
router.post("/public", OrderController.createPublicOrder);
router.get("/public/reference/:referenceId", OrderController.getOrderByReferenceId);

// Authenticated endpoints
router.use(authenticate);

router.post(
  "/",
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS]),
  OrderController.createOrder
);

router.patch(
  "/:id",
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS]),
  OrderController.updateOrder
);

router.patch(
  "/:id/accept",
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  OrderController.acceptOrder
);

router.get(
  "/:id",
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  OrderController.getOrderById
);

router.get(
  "/",
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  OrderController.fetchOrders
);

export default router;
