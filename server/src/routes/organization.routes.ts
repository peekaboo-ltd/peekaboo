import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

// Public route for B2B registration
router.post('/register', OrganizationController.createOrganization);

// Protected routes
router.use(authenticate);

// Get my organization (for BUSINESS users)
router.get(
  '/me',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.getMyOrganization
);
router.get(
  '/me/dashboard',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.getMyDashboardMetrics
);
router.get(
  '/me/orders',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.getMyOrganizationOrders
);
router.get(
  '/me/billing',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.getMyBillingHistory
);
router.get(
  '/me/billing/summary',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.getMyBillingSummary
);

// Org admin can manage members
router.post(
  '/me/members',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.addMemberToMyOrg
);
router.get(
  '/me/members',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.getMyOrgMembers
);
router.patch(
  '/me/members/:membershipId',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.updateMyOrgMemberRole
);
router.delete(
  '/me/members/:membershipId',
  authorize([RoleTypes.BUSINESS]),
  OrganizationController.removeMyOrgMember
);

// Admin routes for managing all organizations
router.get(
  '/',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrganizationController.fetchOrganizations
);
router.get(
  '/:id',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrganizationController.getOrganizationById
);
router.patch(
  '/:id',
  authorize([RoleTypes.ADMIN]),
  OrganizationController.updateOrganization
);
router.patch(
  '/:id/status',
  authorize([RoleTypes.ADMIN]),
  OrganizationController.updateOrganizationStatus
);
router.patch(
  '/:id/business-plan',
  authorize([RoleTypes.ADMIN]),
  OrganizationController.assignBusinessPlan
);
router.get(
  '/:id/members',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrganizationController.getMembers
);
router.get(
  '/:id/orders',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrganizationController.getOrganizationOrders
);
router.get(
  '/:id/billing',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrganizationController.getBillingHistory
);
router.get(
  '/:id/dashboard',
  authorize([RoleTypes.ADMIN, RoleTypes.STAFF]),
  OrganizationController.getDashboardMetrics
);
router.post(
  '/:id/billing/:billingId/invoice',
  authorize([RoleTypes.ADMIN]),
  OrganizationController.generateInvoice
);
router.post(
  '/:id/billing/:billingId/pay',
  authorize([RoleTypes.ADMIN]),
  OrganizationController.markBillingAsPaid
);

export default router;
