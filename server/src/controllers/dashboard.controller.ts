import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';
import { SummaryChartMetric, SummaryChartPeriod } from '../types/dashboard.types';
import { EmailService } from '../integrations/emails/email.service';
import { UUID } from '../types';

const dashboardService = new DashboardService();
const orderService = new OrderService();
const emailService = new EmailService();

const parseDateBoundary = (value: unknown, fallback: Date, endOfDay = false) => {
  if (!value) return fallback;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return fallback;
  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }
  return parsed;
};


const parseOptionalDateBoundary = (value: unknown, endOfDay = false) => {
  if (!value) return undefined;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return undefined;
  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }
  return parsed;
};

const parseOrganizationId = (value: unknown): UUID | undefined => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return undefined;
  }
  return normalized as UUID;
};

export const DashboardController = {
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userRoles = authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const metrics = await dashboardService.getDashboardMetrics(userId, userRoles);

      return res.status(200).json({
        message: 'Dashboard metrics fetched successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userRoles = authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const period = String(req.query.period || 'month');
      const startDate = parseOptionalDateBoundary(req.query.startDate);
      const endDate = parseOptionalDateBoundary(req.query.endDate, true);
      const data = await dashboardService.getOrderChartData(userId, userRoles, period, startDate, endDate);

      return res.status(200).json({
        message: 'Order chart data fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getRevenueChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userRoles = authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const period = String(req.query.period || 'month');
      const startDate = parseOptionalDateBoundary(req.query.startDate);
      const endDate = parseOptionalDateBoundary(req.query.endDate, true);
      const data = await dashboardService.getRevenueChartData(userId, userRoles, period, startDate, endDate);

      return res.status(200).json({
        message: 'Revenue chart data fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDeliveryChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const period = String(req.query.period || 'month');
      const startDate = parseOptionalDateBoundary(req.query.startDate);
      const endDate = parseOptionalDateBoundary(req.query.endDate, true);
      const data = await dashboardService.getDeliveryChartData(userId, period, startDate, endDate);

      return res.status(200).json({
        message: 'Delivery chart data fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSummaryChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userRoles = authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const metric = String(req.query.metric || 'ORDERS');
      const period = String(req.query.period || '30d');
      const startDate = parseOptionalDateBoundary(req.query.startDate);
      const endDate = parseOptionalDateBoundary(req.query.endDate, true);

      const validMetrics: SummaryChartMetric[] = ['ORDERS', 'REVENUE', 'DELIVERIES', 'ACTIVE_USERS'];
      if (!validMetrics.includes(metric as SummaryChartMetric)) {
        return res.status(400).json({ message: 'Invalid metric. Must be one of: ORDERS, REVENUE, DELIVERIES, ACTIVE_USERS' });
      }

      const validPeriods: SummaryChartPeriod[] = ['7d', '30d', '90d'];
      if (!validPeriods.includes(period as SummaryChartPeriod)) {
        return res.status(400).json({ message: 'Invalid period. Must be one of: 7d, 30d, 90d' });
      }

      const data = await dashboardService.getSummaryChartData(
        userId,
        userRoles,
        metric as SummaryChartMetric,
        period as SummaryChartPeriod,
        startDate,
        endDate
      );

      return res.status(200).json({
        message: 'Summary chart data fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async searchOrderByReferenceId(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const referenceId = String(req.query.referenceId || '').trim();
      if (!referenceId) {
        return res.status(400).json({ message: 'referenceId is required' });
      }

      const order = await orderService.getOrderByReferenceId(referenceId);

      return res.status(200).json({
        message: order ? 'Order found' : 'Order not found',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBusinessReport(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userRoles =
        authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];
      const organizationId = parseOrganizationId(req.query.organizationId);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!userRoles.includes(RoleTypes.BUSINESS) && !userRoles.includes(RoleTypes.ADMIN)) {
        return res.status(403).json({ message: 'Business report is only available for business and admin accounts' });
      }
      if (userRoles.includes(RoleTypes.ADMIN) && !organizationId) {
        return res.status(400).json({ message: 'organizationId query parameter is required for admin business reports' });
      }

      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 30);
      const startDate = parseDateBoundary(req.query.startDate, defaultStart);
      const endDate = parseDateBoundary(req.query.endDate, now, true);

      const report = await dashboardService.getBusinessReport(
        {
          requesterUserId: userId as UUID,
          requesterRoles: userRoles,
          organizationId,
        },
        startDate,
        endDate
      );
      return res.status(200).json({
        message: 'Business report fetched successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },

  async downloadBusinessReport(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userRoles =
        authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];
      const organizationId = parseOrganizationId(req.query.organizationId);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!userRoles.includes(RoleTypes.BUSINESS) && !userRoles.includes(RoleTypes.ADMIN)) {
        return res.status(403).json({ message: 'Business report is only available for business and admin accounts' });
      }
      if (userRoles.includes(RoleTypes.ADMIN) && !organizationId) {
        return res.status(400).json({ message: 'organizationId query parameter is required for admin business reports' });
      }

      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 30);
      const startDate = parseDateBoundary(req.query.startDate, defaultStart);
      const endDate = parseDateBoundary(req.query.endDate, now, true);

      const report = await dashboardService.getBusinessReport(
        {
          requesterUserId: userId as UUID,
          requesterRoles: userRoles,
          organizationId,
        },
        startDate,
        endDate
      );
      const html = dashboardService.buildBusinessReportHtml(report);
      const fileName = `peekaboo_business_report_${startDate.toISOString().slice(0, 10)}_${endDate.toISOString().slice(0, 10)}.html`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  },

  async emailBusinessReport(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const userEmail = authReq.user?.email;
      const userName = authReq.user?.name || 'Business user';
      const userRoles =
        authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];
      const organizationId = parseOrganizationId(req.query.organizationId);

      if (!userId || !userEmail) {
        return res.status(401).json({ message: 'Unauthorized or missing email' });
      }
      if (!userRoles.includes(RoleTypes.BUSINESS) && !userRoles.includes(RoleTypes.ADMIN)) {
        return res.status(403).json({ message: 'Business report is only available for business and admin accounts' });
      }
      if (userRoles.includes(RoleTypes.ADMIN) && !organizationId) {
        return res.status(400).json({ message: 'organizationId query parameter is required for admin business reports' });
      }

      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 30);
      const startDate = parseDateBoundary(req.query.startDate, defaultStart);
      const endDate = parseDateBoundary(req.query.endDate, now, true);

      const report = await dashboardService.getBusinessReport(
        {
          requesterUserId: userId as UUID,
          requesterRoles: userRoles,
          organizationId,
        },
        startDate,
        endDate
      );
      const html = dashboardService.buildBusinessReportHtml(report);

      await emailService.sendBusinessReportEmail({
        to: userEmail,
        name: userName,
        html,
        periodStart: startDate,
        periodEnd: endDate,
      });

      return res.status(200).json({
        message: `Business report emailed to ${userEmail}`,
      });
    } catch (error) {
      next(error);
    }
  },
};
