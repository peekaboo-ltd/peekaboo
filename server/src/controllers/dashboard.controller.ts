import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';
import { SummaryChartMetric, SummaryChartPeriod } from '../types/dashboard.types';

const dashboardService = new DashboardService();
const orderService = new OrderService();

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
      const data = await dashboardService.getOrderChartData(userId, userRoles, period);

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
      const data = await dashboardService.getRevenueChartData(userId, userRoles, period);

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
      const data = await dashboardService.getDeliveryChartData(userId, period);

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
        period as SummaryChartPeriod
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
};
