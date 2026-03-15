import { Router } from 'express';
import { BusinessPlanController } from '../controllers/businessPlan.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

// Public routes
router.get('/public', BusinessPlanController.getPublicBusinessPlans);

// Admin only routes
// All routes below require authentication
router.use(authenticate);

router.post(
  '/',
  authorize([RoleTypes.ADMIN]),
  BusinessPlanController.createBusinessPlan
);
router.patch(
  '/:id',
  authorize([RoleTypes.ADMIN]),
  BusinessPlanController.updateBusinessPlan
);
router.delete(
  '/:id',
  authorize([RoleTypes.ADMIN]),
  BusinessPlanController.deleteBusinessPlan
);

// Admin and Staff can view
router.get(
  '/',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  BusinessPlanController.fetchBusinessPlans
);
router.get(
  '/active',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  BusinessPlanController.getActivePlans
);
router.get(
  '/active/stats',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  BusinessPlanController.getActivePlansWithStats
);
router.get(
  '/available',
  authorize([RoleTypes.BUSINESS]),
  BusinessPlanController.getAvailablePlansForBusiness
);
router.get(
  '/:id',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  BusinessPlanController.getBusinessPlanById
);
router.get(
  '/:id/organization-count',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  BusinessPlanController.getOrganizationCountForPlan
);

export default router;
