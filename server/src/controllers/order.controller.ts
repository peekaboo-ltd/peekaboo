import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { UUID } from '../types';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types/auth.types';

const orderService = new OrderService();
const userService = new UserService();

export const OrderController = {
  // ACCEPT ORDER
  async acceptOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { phoneNumber } = req.body;

      let createdById: UUID | undefined = undefined;

      if (phoneNumber) {
        const user = await userService.getUserByCondition({
          phoneNumber,
        });
        createdById = user?.id;
      }

      // ACCEPT ORDER
      const order = await orderService.acceptOrder(id as UUID, createdById);

      // RETURN ORDER
      return res.status(200).json({
        message: 'Order accepted',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // CREATE ORDER
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { order } = req.body;

      // CREATE ORDER
      const createdOrder = await orderService.createOrder(order);

      // RETURN ORDER
      return res.status(201).json({
        message: 'Order created successfully',
        data: createdOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  // CREATE PUBLIC ORDER
  async createPublicOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { senderPhoneNumber, recipientPhoneNumber } = req.body;

      // CREATE PUBLIC ORDER (returns order + auth)
      const result = await orderService.createPublicOrder({
        senderPhoneNumber,
        recipientPhoneNumber,
      });

      // RETURN ORDER AND AUTH DATA
      return res.status(201).json({
        message: 'Order created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORDER BY ID
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // GET ORDER BY ID
      const order = await orderService.getOrderById(id as UUID);

      // RETURN ORDER
      return res.status(200).json({
        message: 'Order fetched successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE ORDER
  async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { order } = req.body;

      const { user } = req as AuthenticatedRequest;

      // UPDATE ORDER
      const updatedOrder = await orderService.updateOrder(id as UUID, order, {
        createdById: user?.id,
      });

      // RETURN ORDER
      return res.status(200).json({
        message: 'Order updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  // FETCH ORDERS
  async fetchOrders(req: Request, res: Response, next: NextFunction) {
    try {
      // FETCH ORDERS
      const fetchedOrders = await orderService.fetchOrders(req.query);

      // RETURN ORDERS
      return res.status(200).json({
        message: 'Orders fetched successfully',
        data: fetchedOrders,
      });
    } catch (error) {
      next(error);
    }
  },
};
