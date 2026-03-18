import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

// Public order endpoints (no auth required, order UUID acts as access key)
router.post('/public', OrderController.createPublicOrder);
router.get(
  '/public/reference/:referenceId',
  OrderController.getOrderByReferenceId,
);
router.get('/public/:id', OrderController.getPublicOrderById);
router.patch('/public/:id', OrderController.updatePublicOrder);

// Authenticated endpoints
router.use(authenticate);

router.post(
  '/',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.STAFF,
    RoleTypes.RIDER,
  ]),
  OrderController.createOrder,
);

router.patch(
  '/:id',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.STAFF,
    RoleTypes.RIDER,
    RoleTypes.GUEST,
  ]),
  OrderController.updateOrder,
);

router.delete(
  '/:id',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS]),
  OrderController.deleteOrder,
);

router.patch(
  '/:id/accept',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.RIDER,
    RoleTypes.STAFF,
  ]),
  OrderController.acceptOrder,
);

router.post(
  '/import/bulk',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.STAFF,
    RoleTypes.RIDER,
  ]),
  OrderController.importBulkOrders,
);

router.get(
  '/:id',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.RIDER,
    RoleTypes.STAFF,
    RoleTypes.GUEST,
  ]),
  OrderController.getOrderById,
);

router.get(
  '/',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.RIDER,
    RoleTypes.STAFF,
  ]),
  OrderController.fetchOrders,
);

export default router;
