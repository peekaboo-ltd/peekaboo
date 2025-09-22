import { NextFunction, Request, Response } from 'express';
import { OrderAssignmentService } from '../services/orderAssignment.service';

const orderAssignmentService = new OrderAssignmentService();

export const OrderAssignmentController = {
  // CREATE ORDER ASSIGNMENT
  async createOrderAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, assignedToId } = req.body;

      // CREATE ORDER ASSIGNMENT
      const createdOrderAssignment =
        await orderAssignmentService.createOrderAssignment({ orderId, assignedToId });

      // RETURN ORDER ASSIGNMENT
      return res.status(201).json({
        message: 'Order assignment created successfully',
        data: createdOrderAssignment,
      });
    } catch (error) {
      next(error);
    }
  },
};
