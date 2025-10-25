import { NextFunction, Request, Response } from 'express';
import { OrderAssignmentService } from '../services/orderAssignment.service';
import { UUID } from '../types';

const orderAssignmentService = new OrderAssignmentService();

export const OrderAssignmentController = {
  // CREATE ORDER ASSIGNMENT
  async createOrderAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, assignedToId } = req.body;

      // CREATE ORDER ASSIGNMENT
      const createdOrderAssignment =
        await orderAssignmentService.createOrderAssignment({
          orderId,
          assignedToId,
        });

      // RETURN ORDER ASSIGNMENT
      return res.status(201).json({
        message: 'Order assignment created successfully',
        data: createdOrderAssignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // FETCH ORDER ASSIGNMENTS
  async fetchOrderAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      // FETCH ORDER ASSIGNMENTS
      const fetchedOrderAssignments =
        await orderAssignmentService.fetchOrderAssignments(req.query);

      // RETURN ORDER ASSIGNMENTS
      return res.status(200).json({
        message: 'Order assignments fetched successfully',
        data: fetchedOrderAssignments,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORDER ASSIGNMENT BY ID
  async getOrderAssignmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      // GET ORDER ASSIGNMENT BY ID
      const orderAssignment =
        await orderAssignmentService.getOrderAssignmentById(id as UUID);

      // RETURN ORDER ASSIGNMENT
      return res.status(200).json({
        message: 'Order assignment fetched successfully',
        data: orderAssignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // ACCEPT ORDER ASSIGNMENT
  async acceptOrderAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // ACCEPT ORDER ASSIGNMENT
      const acceptedOrderAssignment =
        await orderAssignmentService.acceptOrderAssignment(id as UUID);

      // RETURN ORDER ASSIGNMENT
      return res.status(200).json({
        message: 'Order assignment accepted successfully',
        data: acceptedOrderAssignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // REJECT ORDER ASSIGNMENT
  async rejectOrderAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // REJECT ORDER ASSIGNMENT
      const rejectedOrderAssignment =
        await orderAssignmentService.rejectOrderAssignment(id as UUID);

      // RETURN ORDER ASSIGNMENT
      return res.status(200).json({
        message: 'Order assignment rejected successfully',
        data: rejectedOrderAssignment,
      });
    } catch (error) {
      next(error);
    }
  },
};
