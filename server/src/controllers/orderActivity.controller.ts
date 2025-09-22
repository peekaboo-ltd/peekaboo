import { NextFunction, Request, Response } from 'express';
import { OrderActivityService } from '../services/orderActivity.service';
import { AuthenticatedRequest } from '../types/auth.types';

const orderActivityService = new OrderActivityService();

export const OrderActivityController = {
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
