import { Router } from 'express';
import { OrderAssignmentController } from '../controllers/orderAssignment.controller';

const router = Router();

router.post('/', OrderAssignmentController.createOrderAssignment);

router.get('/available-riders', OrderAssignmentController.getAvailableRiders);

router.get('/', OrderAssignmentController.fetchOrderAssignments);

router.get('/:id', OrderAssignmentController.getOrderAssignmentById);

router.patch('/:id/accept', OrderAssignmentController.acceptOrderAssignment);

router.patch('/:id/reject', OrderAssignmentController.rejectOrderAssignment);

router.patch('/:id/complete', OrderAssignmentController.completeOrderAssignment);

export default router;
