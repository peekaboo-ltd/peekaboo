import { Router } from 'express';
import { BatchController } from '../controllers/batch.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

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
  BatchController.createBatch,
);

router.get(
  '/:id',
  authorize([
    RoleTypes.CUSTOMER,
    RoleTypes.BUSINESS,
    RoleTypes.ADMIN,
    RoleTypes.STAFF,
    RoleTypes.RIDER,
  ]),
  BatchController.getBatchById,
);

export default router;
