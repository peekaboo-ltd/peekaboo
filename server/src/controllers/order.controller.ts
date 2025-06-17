import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { UUID } from "../types";
import { UserService } from "../services/user.service";

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
        message: "Order accepted",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },
};
