import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { DashboardService } from '../services/dashboard.service';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';
import { SummaryChartMetric, SummaryChartPeriod } from '../types/dashboard.types';
import { EmailService } from '../integrations/emails/email.service';
import { UUID } from '../types';
import { UserService } from '../services/user.service';
import { uploadProblemReportEvidenceToCloudinary } from '../integrations/cloudinary/cloudinary.service';

const dashboardService = new DashboardService();
const orderService = new OrderService();
const emailService = new EmailService();
const userService = new UserService();

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

const parseDateTime = (value: unknown, fallback: Date) => {
  if (!value) return fallback;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed;
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

      const startDate = parseOptionalDateBoundary(req.query.startDate);
      const endDate = parseOptionalDateBoundary(req.query.endDate, true);
      const metrics = await dashboardService.getDashboardMetrics(userId, userRoles, startDate, endDate);

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
      const userRoles = authReq.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const period = String(req.query.period || 'month');
      const startDate = parseOptionalDateBoundary(req.query.startDate);
      const endDate = parseOptionalDateBoundary(req.query.endDate, true);
      const data = await dashboardService.getDeliveryChartData(userId, period, startDate, endDate, userRoles);

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

  async reportProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const file = req.file as (Express.Multer.File & { path?: string }) | undefined;
      const { description, capturedAt, mediaType, locationLabel, submissionType } = req.body as {
        description?: string;
        capturedAt?: string;
        mediaType?: string;
        locationLabel?: string;
        submissionType?: string;
        overlayTimestamp?: string;
        overlayLocationLabel?: string;
        overlayAppliedOnClient?: string;
      };

      if (!file) {
        return res.status(400).json({ message: 'Evidence file is required' });
      }

      if (!description || !description.trim()) {
        return res.status(400).json({ message: 'Description is required' });
      }

      const localFilePath = file.path;
      if (!localFilePath) {
        return res.status(500).json({ message: 'Failed to process uploaded evidence file' });
      }

      const normalizedMediaType =
        mediaType === 'video' || file.mimetype.startsWith('video/') ? 'video' : 'photo';
      const normalizedSubmissionType = String(submissionType || '').trim().toUpperCase();
      const inferredSubmissionType = description.trim().startsWith('[Receipt]') ? 'RECEIPT' : 'PROBLEM';
      const finalSubmissionType =
        normalizedSubmissionType.length > 0
          ? normalizedSubmissionType
          : inferredSubmissionType;
      if (finalSubmissionType !== 'PROBLEM' && finalSubmissionType !== 'RECEIPT') {
        return res.status(400).json({ message: 'Invalid submissionType. Use PROBLEM or RECEIPT.' });
      }
      const reportTimestamp = capturedAt || new Date().toISOString();
      const overlayAppliedOnClient = String(req.body?.overlayAppliedOnClient || '').toLowerCase() === 'true';
      const overlayTimestamp = String(req.body?.overlayTimestamp || '').trim();
      const overlayLocationLabel = String(
        req.body?.overlayLocationLabel || locationLabel || 'Location unavailable'
      ).trim();

      let evidenceUrl = '';
      try {
        evidenceUrl = await uploadProblemReportEvidenceToCloudinary(localFilePath, {
          userId,
          mediaType: normalizedMediaType,
          overlayTimestamp,
          overlayLocationLabel,
          overlayAppliedOnClient,
        });

        await userService.createProblemReport({
          userId: userId as UUID,
          imageUrl: evidenceUrl,
          mediaType: normalizedMediaType,
          submissionType: finalSubmissionType,
          description: description.trim(),
          capturedAt: reportTimestamp,
          locationLabel: locationLabel || undefined,
          source: 'dashboard:report-problem',
          overlayApplied: true,
          overlayVersion: 'v1',
          overlaySource: overlayAppliedOnClient ? 'client_and_server' : 'server',
        });

        if (finalSubmissionType === 'PROBLEM') {
          emailService.sendProblemReportAdminNotification({
            riderId: String(userId),
            riderName: authReq.user?.name || 'Unknown rider',
            riderPhoneNumber: authReq.user?.phoneNumber,
            submissionType: finalSubmissionType,
            capturedAt: reportTimestamp,
            locationLabel: locationLabel || undefined,
            description: description.trim(),
            evidenceUrl,
            submittedAt: new Date(),
          }).catch(() => {});
        }
      } catch (error) {
        const uploadErrorMessage =
          error instanceof Error && error.message
            ? error.message
            : 'Failed to upload problem report evidence';
        return res.status(502).json({ message: uploadErrorMessage });
      } finally {
        try {
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
        } catch {
          // ignore local cleanup errors
        }
      }

      return res.status(200).json({
        message: 'Problem report submitted successfully',
        data: {
          reportedBy: userId,
          mediaType: normalizedMediaType,
          submissionType: finalSubmissionType,
          evidenceUrl,
          capturedAt: reportTimestamp,
          description: description.trim(),
          locationLabel: locationLabel || undefined,
          submittedAt: new Date().toISOString(),
        },
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
