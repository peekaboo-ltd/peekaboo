import { Router } from 'express';
import { OrderAssignmentController } from '../controllers/orderAssignment.controller';

const router = Router();

router.post('/', OrderAssignmentController.createOrderAssignment);

export default router;
