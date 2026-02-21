import { Router } from 'express';
import { OrderActivityController } from '../controllers/orderActivity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  OrderActivityController.fetchOrderActivities
);

router.post(
  '/:orderId/confirm-dispatch',
  authorize([RoleTypes.RIDER, RoleTypes.ADMIN]),
  OrderActivityController.confirmOrderDispatch
);

router.post(
  '/:orderId/complete',
  authorize([RoleTypes.RIDER, RoleTypes.ADMIN]),
  OrderActivityController.completeOrder
);

router.post(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.RIDER]),
  OrderActivityController.createOrderActivity
);

export default router;
