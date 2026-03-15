import { Router } from 'express';
import { PushController } from '../controllers/push.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

router.use(authenticate);

router.post(
  '/subscriptions',
  authorize([
    RoleTypes.RIDER,
    RoleTypes.STAFF,
    RoleTypes.ADMIN,
    RoleTypes.BUSINESS,
    RoleTypes.CUSTOMER,
  ]),
  PushController.registerSubscription
);

router.delete(
  '/subscriptions/:token',
  authorize([
    RoleTypes.RIDER,
    RoleTypes.STAFF,
    RoleTypes.ADMIN,
    RoleTypes.BUSINESS,
    RoleTypes.CUSTOMER,
  ]),
  PushController.disableSubscription
);

router.post('/test', authorize([RoleTypes.ADMIN]), PushController.sendTestPush);

export default router;
