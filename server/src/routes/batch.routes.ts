import { Router } from 'express';
import { BatchController } from '../controllers/batch.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

router.use(authenticate);

const allRoles = [
  RoleTypes.CUSTOMER,
  RoleTypes.BUSINESS,
  RoleTypes.ADMIN,
  RoleTypes.STAFF,
  RoleTypes.RIDER,
];

router.get(
  '/',
  authorize(allRoles),
  BatchController.listBatches,
);

router.post(
  '/',
  authorize(allRoles),
  BatchController.createBatch,
);

router.get(
  '/:id',
  authorize(allRoles),
  BatchController.getBatchById,
);

router.get(
  '/:id/orders',
  authorize(allRoles),
  BatchController.getBatchOrders,
);

router.patch(
  '/:id/complete',
  authorize(allRoles),
  BatchController.completeBatch,
);

export default router;
