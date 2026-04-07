import { Router } from 'express';
import { PushController } from '../controllers/push.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

router.use(authenticate);

router.post('/test', authorize([RoleTypes.ADMIN]), PushController.sendTestPush);

export default router;
