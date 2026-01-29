import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';
import { OrganizationMembershipService } from '../services/organizationMembership.service';
import { OrganizationBillingService } from '../services/organizationBilling.service';
import { OrganizationDashboardService } from '../services/organizationDashboard.service';
import { OrderService } from '../services/order.service';
import { UUID } from '../types';
import { AuthRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';

const organizationService = new OrganizationService();
const membershipService = new OrganizationMembershipService();
const billingService = new OrganizationBillingService();
const dashboardService = new OrganizationDashboardService();
const orderService = new OrderService();
const userService = new UserService();

export const OrganizationController = {
  // CREATE ORGANIZATION (PUBLIC REGISTRATION)
  async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization, adminUser } = req.body;

      const result = await organizationService.createOrganization({
        organization,
        adminUser,
      });

      // Generate JWT token for the admin user
      const token = jwt.sign(
        { id: result.adminUserId },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      // Fetch complete user details with roles
      const userWithRoles = await userService.getUserById(result.adminUserId);

      return res.status(201).json({
        message: 'Organization created successfully',
        data: {
          organization: result.organization,
          auth: {
            token,
            user: userWithRoles,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORGANIZATION BY ID (ADMIN/STAFF)
  async getOrganizationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const organization = await organizationService.getOrganizationById(
        id as UUID
      );

      return res.status(200).json({
        message: 'Organization fetched successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE ORGANIZATION (ADMIN)
  async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const organization = await organizationService.updateOrganization(
        id as UUID,
        req.body
      );

      return res.status(200).json({
        message: 'Organization updated successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE ORGANIZATION STATUS (ADMIN)
  async updateOrganizationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const organization = await organizationService.updateOrganizationStatus(
        id as UUID,
        status
      );

      return res.status(200).json({
        message: 'Organization status updated successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  },

  // ASSIGN BUSINESS PLAN (ADMIN)
  async assignBusinessPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { businessPlanId } = req.body;

      const organization = await organizationService.assignBusinessPlan(
        id as UUID,
        businessPlanId
      );

      return res.status(200).json({
        message: 'Business plan assigned successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  },

  // FETCH ORGANIZATIONS (ADMIN/STAFF)
  async fetchOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const organizations = await organizationService.fetchOrganizations(
        req.query
      );

      return res.status(200).json({
        message: 'Organizations fetched successfully',
        data: organizations,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MY ORGANIZATION (BUSINESS USER)
  async getMyOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      return res.status(200).json({
        message: 'Organization fetched successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  },

  // ADD MEMBER TO MY ORGANIZATION (BUSINESS ADMIN)
  async addMemberToMyOrg(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      // Check if user is admin
      const isAdmin = await membershipService.isOrganizationAdmin(
        userId,
        organization.id
      );

      if (!isAdmin) {
        return res.status(403).json({
          message: 'Only organization admins can add members',
        });
      }

      const membership = await membershipService.addMember({
        organizationId: organization.id,
        user: req.body.user,
        role: req.body.role,
        addedById: userId,
      });

      return res.status(201).json({
        message: 'Member added successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MY ORGANIZATION MEMBERS (BUSINESS USER)
  async getMyOrgMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      const members = await membershipService.getOrganizationMembers(
        organization.id,
        req.query
      );

      return res.status(200).json({
        message: 'Members fetched successfully',
        data: members,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE MEMBER ROLE IN MY ORG (BUSINESS ADMIN)
  async updateMyOrgMemberRole(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { membershipId } = req.params;
      const { role } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      // Check if user is admin
      const isAdmin = await membershipService.isOrganizationAdmin(
        userId,
        organization.id
      );

      if (!isAdmin) {
        return res.status(403).json({
          message: 'Only organization admins can update member roles',
        });
      }

      const membership = await membershipService.updateMemberRole(
        membershipId as UUID,
        role,
        userId
      );

      return res.status(200).json({
        message: 'Member role updated successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // REMOVE MEMBER FROM MY ORG (BUSINESS ADMIN)
  async removeMyOrgMember(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { membershipId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      // Check if user is admin
      const isAdmin = await membershipService.isOrganizationAdmin(
        userId,
        organization.id
      );

      if (!isAdmin) {
        return res.status(403).json({
          message: 'Only organization admins can remove members',
        });
      }

      await membershipService.removeMember(membershipId as UUID, userId);

      return res.status(200).json({
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MEMBERS (ADMIN/STAFF)
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const members = await membershipService.getOrganizationMembers(
        id as UUID,
        req.query
      );

      return res.status(200).json({
        message: 'Members fetched successfully',
        data: members,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORGANIZATION ORDERS (ADMIN/STAFF)
  async getOrganizationOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const orders = await orderService.fetchOrganizationOrders(
        id as UUID,
        req.query
      );

      return res.status(200).json({
        message: 'Orders fetched successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MY ORGANIZATION ORDERS (BUSINESS USER)
  async getMyOrganizationOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      const orders = await orderService.fetchOrganizationOrders(
        organization.id,
        req.query
      );

      return res.status(200).json({
        message: 'Orders fetched successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET BILLING HISTORY (ADMIN/STAFF)
  async getBillingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const billings = await billingService.getBillingHistory(
        id as UUID,
        req.query
      );

      return res.status(200).json({
        message: 'Billing history fetched successfully',
        data: billings,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MY BILLING HISTORY (BUSINESS USER)
  async getMyBillingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      const billings = await billingService.getBillingHistory(
        organization.id,
        req.query
      );

      return res.status(200).json({
        message: 'Billing history fetched successfully',
        data: billings,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET BILLING SUMMARY (ADMIN/STAFF)
  async getBillingSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const summary = await billingService.getBillingSummary(id as UUID);

      return res.status(200).json({
        message: 'Billing summary fetched successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MY BILLING SUMMARY (BUSINESS USER)
  async getMyBillingSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      const summary = await billingService.getBillingSummary(organization.id);

      return res.status(200).json({
        message: 'Billing summary fetched successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  // GENERATE INVOICE (ADMIN)
  async generateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { billingId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const billing = await billingService.generateInvoice(
        billingId as UUID,
        userId
      );

      return res.status(200).json({
        message: 'Invoice generated successfully',
        data: billing,
      });
    } catch (error) {
      next(error);
    }
  },

  // MARK BILLING AS PAID (ADMIN)
  async markBillingAsPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { billingId } = req.params;
      const { notes } = req.body;

      const billing = await billingService.markAsPaid(billingId as UUID, notes);

      return res.status(200).json({
        message: 'Billing marked as paid successfully',
        data: billing,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET DASHBOARD METRICS (ADMIN/STAFF)
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const metrics = await dashboardService.getOrganizationDashboardMetrics(
        id as UUID
      );

      return res.status(200).json({
        message: 'Dashboard metrics fetched successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET MY DASHBOARD METRICS (BUSINESS USER)
  async getMyDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const organization = await organizationService.getOrganizationByUserId(
        userId
      );

      if (!organization) {
        return res.status(404).json({
          message: 'You are not a member of any organization',
        });
      }

      const metrics = await dashboardService.getOrganizationDashboardMetrics(
        organization.id
      );

      return res.status(200).json({
        message: 'Dashboard metrics fetched successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },
};
