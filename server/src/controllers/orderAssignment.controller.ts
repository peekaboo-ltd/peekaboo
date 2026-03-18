import { NextFunction, Request, Response } from 'express';
import { OrderAssignmentService } from '../services/orderAssignment.service';
import { OrderService } from '../services/order.service';
import { UUID } from '../types';
import { AuthRequest } from '../types/auth.types';
import { RoleTypes } from '../constants/role.constants';

const orderAssignmentService = new OrderAssignmentService();
const orderService = new OrderService();

const getRiderId = (req: Request): UUID | undefined => {
  const authReq = req as AuthRequest;
  const hasRiderRole =
    authReq.user?.userRoles?.some(
      (userRole) => userRole.role.name === RoleTypes.RIDER
    ) ?? false;

  return hasRiderRole ? (authReq.user?.id as UUID | undefined) : undefined;
};

export const OrderAssignmentController = {
  // CREATE PUBLIC ORDER ASSIGNMENT (no auth required, uses order's senderId)
  async createPublicOrderAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, assignedToId } = req.body;

      // Verify the order exists and get senderId for attribution
      const order = await orderService.getOrderById(orderId as UUID);

      const createdOrderAssignment =
        await orderAssignmentService.createOrderAssignment({
          orderId: order.id,
          assignedToId,
        });

      return res.status(201).json({
        message: 'Order assignment created successfully',
        data: createdOrderAssignment,
      });
    } catch (error) {
      next(error);
    }
  },

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
        await orderAssignmentService.fetchOrderAssignments(req.query, {
          riderId: getRiderId(req),
        });

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
        await orderAssignmentService.getOrderAssignmentById(id as UUID, {
          riderId: getRiderId(req),
        });

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
