import { Router } from 'express';
import { OrderActivityController } from '../controllers/orderActivity.controller';

const router = Router();

router.get('/', OrderActivityController.fetchOrderActivities);
router.post('/', OrderActivityController.createOrderActivity);

export default router;
