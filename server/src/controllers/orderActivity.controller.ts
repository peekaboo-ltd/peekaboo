import { NextFunction, Request, Response } from 'express';
import { OrderActivityService } from '../services/orderActivity.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';
import { UUID } from '../types';

const orderActivityService = new OrderActivityService();

export const OrderActivityController = {
  // FETCH PUBLIC ORDER ACTIVITIES (no auth, requires orderId query param)
  async fetchPublicOrderActivities(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.query.orderId) {
        return res.status(400).json({
          message: 'orderId query parameter is required',
        });
      }

      const orderActivity = await orderActivityService.fetchOrderActivities({
        params: req.query,
      });

      return res.status(200).json({
        message: 'Order activity fetched successfully',
        data: orderActivity,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORDER ACTIVITY
  async fetchOrderActivities(req: Request, res: Response, next: NextFunction) {
    try {
      // GET ORDER ACTIVITY
      const orderActivity = await orderActivityService.fetchOrderActivities({
        params: req.query,
      });

      // RETURN ORDER ACTIVITY
      return res.status(200).json({
        message: 'Order activity fetched successfully',
        data: orderActivity,
      });
    } catch (error) {
      next(error);
    }
  },



  async confirmOrderDispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { trackingId } = req.body;
      const { user } = req as AuthenticatedRequest;

      const updatedActivities = await orderActivityService.confirmOrderDispatch({
        orderId: orderId as UUID,
        trackingId,
        actorId: user.id as UUID,
        isAdmin: user.role === RoleTypes.ADMIN,
      });

      return res.status(200).json({
        message: 'Order confirmed and marked in transit successfully',
        data: updatedActivities,
      });
    } catch (error) {
      next(error);
    }
  },

  async completeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { trackingId } = req.body;
      const { user } = req as AuthenticatedRequest;

      const completedActivity = await orderActivityService.markOrderCompleted({
        orderId: orderId as UUID,
        trackingId,
        actorId: user.id as UUID,
        isAdmin: user.role === RoleTypes.ADMIN,
      });

      return res.status(200).json({
        message: 'Order marked as completed successfully',
        data: completedActivity,
      });
    } catch (error) {
      next(error);
    }
  },

  // CREATE ORDER ACTIVITY
  async createOrderActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { notes, orderId, status } = req.body;

      const { user } = req as AuthenticatedRequest;

      // CREATE ORDER ACTIVITY
      const createdOrderActivity = await orderActivityService.createOrderActivity({
        notes,
        orderId,
        status,
        createdById: user?.id,
      });

      // RETURN ORDER ACTIVITY
      return res.status(201).json({
        message: 'Order activity created successfully',
        data: createdOrderActivity,
      });
    } catch (error) {
      next(error);
    }
  },
};
