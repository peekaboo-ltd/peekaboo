import { Router } from 'express';
import { OrderAssignmentController } from '../controllers/orderAssignment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize([RoleTypes.CUSTOMER, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrderAssignmentController.createOrderAssignment
);

router.get(
  '/',
  authorize([RoleTypes.STAFF, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  OrderAssignmentController.fetchOrderAssignments
);

router.get(
  '/:id',
  authorize([RoleTypes.STAFF, RoleTypes.BUSINESS, RoleTypes.ADMIN, RoleTypes.RIDER]),
  OrderAssignmentController.getOrderAssignmentById
);

router.patch(
  '/:id/accept',
  authorize([RoleTypes.RIDER, RoleTypes.ADMIN]),
  OrderAssignmentController.acceptOrderAssignment
);

router.patch(
  '/:id/reject',
  authorize([RoleTypes.RIDER, RoleTypes.ADMIN]),
  OrderAssignmentController.rejectOrderAssignment
);

export default router;
