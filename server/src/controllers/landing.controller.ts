import { NextFunction, Request, Response } from 'express';
import { OrderStatus } from '../constants/order.constants';
import { ValidationError } from '../helpers/errors.helper';
import { LandingService } from '../services/landing.service';

const landingService = new LandingService();

const parseOrderStatus = (value?: string): OrderStatus => {
  if (!value) return OrderStatus.COMPLETED;
  if (Object.values(OrderStatus).includes(value as OrderStatus)) return value as OrderStatus;
  throw new ValidationError(
    `Invalid orderStatus. Expected one of: ${Object.values(OrderStatus).join(', ')}`
  );
};

export const LandingController = {
  async getLandingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const orderStatus = parseOrderStatus(req.query.orderStatus as string | undefined);
      const stats = await landingService.getLandingStats(orderStatus);

      return res.status(200).json({
        message: 'Landing stats fetched successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};

