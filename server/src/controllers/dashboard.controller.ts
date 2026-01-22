import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';

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
