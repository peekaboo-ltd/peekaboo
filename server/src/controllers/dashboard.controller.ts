import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';

const dashboardService = new DashboardService();

export const DashboardController = {
  async getDashboardMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userRoles = req.user?.userRoles?.map((ur) => ur.role.name as RoleTypes) || [];

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
};
