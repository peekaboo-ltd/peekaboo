import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { UUID } from '../types';
import { Order } from '../entities/order.entity';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../types/auth.types';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../helpers/errors.helper';
import { RoleTypes } from '../constants/role.constants';

const orderService = new OrderService();
const userService = new UserService();

type OrderLocation = NonNullable<Order['locationFrom']>;

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const LOCATION_LABEL_MAX_LENGTH = 512;

const normalizeLocationLabel = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim().slice(0, LOCATION_LABEL_MAX_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeOrderLocation = (
  value: unknown,
  fieldName: 'locationFrom' | 'locationTo'
): OrderLocation | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object with latitude and longitude`);
  }

  const location = value as Record<string, unknown>;
  const { latitude, longitude } = location;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new ValidationError(
      `${fieldName} must include numeric latitude and longitude`
    );
  }

  // Optional human friendly labels captured by the place picker.
  const name = normalizeLocationLabel(location.name);
  const formattedAddress = normalizeLocationLabel(location.formattedAddress);
  const placeId = normalizeLocationLabel(location.placeId);

  return {
    latitude,
    longitude,
    ...(name ? { name } : {}),
    ...(formattedAddress ? { formattedAddress } : {}),
    ...(placeId ? { placeId } : {}),
  };
};

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
      const {
        order: rawOrder,
        senderPhoneNumber: senderPhoneFromBody,
        recipientPhoneNumber: recipientPhoneFromBody,
      } = req.body;
      const requestBody = req.body as Record<string, unknown>;
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const orderInput = (rawOrder ?? {}) as Partial<Order> & {
        senderPhoneNumber?: string;
        recipientPhoneNumber?: string;
      };
      const {
        senderPhoneNumber: _senderPhoneNumber,
        recipientPhoneNumber: _recipientPhoneNumber,
        locationFrom: locationFromFromOrder,
        locationTo: locationToFromOrder,
        ...persistableOrderInput
      } = orderInput;

      const senderPhoneNumber = senderPhoneFromBody ?? orderInput.senderPhoneNumber;
      const recipientPhoneNumber =
        recipientPhoneFromBody ?? orderInput.recipientPhoneNumber;
      const locationFrom = normalizeOrderLocation(
        hasOwn(requestBody, 'locationFrom')
          ? requestBody.locationFrom
          : locationFromFromOrder,
        'locationFrom'
      );
      const locationTo = normalizeOrderLocation(
        hasOwn(requestBody, 'locationTo') ? requestBody.locationTo : locationToFromOrder,
        'locationTo'
      );

      let senderId = orderInput.senderId;
      let recipientId = orderInput.recipientId;

      if (senderPhoneNumber && !senderId) {
        const sender =
          (await userService.getUserByCondition({ phoneNumber: senderPhoneNumber })) ||
          (await userService.createUser({ phoneNumber: senderPhoneNumber }));
        senderId = sender?.id;
      }

      if (recipientPhoneNumber && !recipientId) {
        const recipient =
          (await userService.getUserByCondition({ phoneNumber: recipientPhoneNumber })) ||
          (await userService.createUser({ phoneNumber: recipientPhoneNumber }));
        recipientId = recipient?.id;
      }

      const order: Partial<Order> = {
        ...persistableOrderInput,
        senderId,
        recipientId,
        createdById: user.id,
        initialFee: orderInput.initialFee ?? 1500,
        ...(locationFrom !== undefined ? { locationFrom } : {}),
        ...(locationTo !== undefined ? { locationTo } : {}),
      };

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

  // IMPORT BULK ORDERS
  async importBulkOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const imported = await orderService.importBulkOrders(req.body, user);

      return res.status(201).json({
        message: 'Bulk orders imported successfully',
        data: imported,
      });
    } catch (error) {
      next(error);
    }
  },

  // CREATE PUBLIC ORDER
  async createPublicOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        order: rawOrder,
        senderPhoneNumber: senderPhoneFromBody,
        recipientPhoneNumber: recipientPhoneFromBody,
      } = req.body;
      const requestBody = req.body as Record<string, unknown>;
      const orderInput = (rawOrder ?? {}) as Partial<Order> & {
        senderPhoneNumber?: string;
        recipientPhoneNumber?: string;
      };

      const senderPhoneNumber = senderPhoneFromBody ?? orderInput.senderPhoneNumber;
      const recipientPhoneNumber =
        recipientPhoneFromBody ?? orderInput.recipientPhoneNumber;
      const locationFrom = normalizeOrderLocation(
        hasOwn(requestBody, 'locationFrom')
          ? requestBody.locationFrom
          : orderInput.locationFrom,
        'locationFrom'
      );
      const locationTo = normalizeOrderLocation(
        hasOwn(requestBody, 'locationTo') ? requestBody.locationTo : orderInput.locationTo,
        'locationTo'
      );

      const result = await orderService.createPublicOrder({
        senderPhoneNumber,
        recipientPhoneNumber,
        ...(locationFrom !== undefined ? { locationFrom } : {}),
        ...(locationTo !== undefined ? { locationTo } : {}),
      });

      return res.status(201).json({
        message: 'Order created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET PUBLIC ORDER BY ID (no auth required, order UUID is the access key)
  async getPublicOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id as UUID);

      return res.status(200).json({
        message: 'Order fetched successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE PUBLIC ORDER (no auth required, only whitelisted fields)
  async updatePublicOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { order } = req.body;

      const existingOrder = await orderService.getOrderById(id as UUID);

      // Only allow updating location and fee fields for public orders
      const allowedFields: (keyof Order)[] = [
        'locationFrom',
        'locationTo',
        'finalFee',
      ];
      const sanitized: Partial<Order> = {};
      for (const key of allowedFields) {
        if (order?.[key] !== undefined) {
          (sanitized as Record<string, unknown>)[key] = order[key];
        }
      }

      // Locations arrive as free-form JSON, so validate them the same way the
      // create path does instead of persisting whatever was sent.
      if (sanitized.locationFrom !== undefined) {
        sanitized.locationFrom = normalizeOrderLocation(
          sanitized.locationFrom,
          'locationFrom'
        );
      }
      if (sanitized.locationTo !== undefined) {
        sanitized.locationTo = normalizeOrderLocation(
          sanitized.locationTo,
          'locationTo'
        );
      }

      const updatedOrder = await orderService.updateOrder(id as UUID, sanitized, {
        createdById: existingOrder.createdById,
      });

      return res.status(200).json({
        message: 'Order updated successfully',
        data: updatedOrder,
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

  async deferPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const deferredPayment = await orderService.deferOrderPayment(id as UUID, {
        actorId: user.id,
        actorRoles:
          user.userRoles?.map((userRole) => userRole.role.name as RoleTypes) || [],
      });

      return res.status(200).json({
        message: 'Order payment deferred successfully',
        data: deferredPayment,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORDER BY REFERENCE ID (PUBLIC)
  async getOrderByReferenceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { referenceId } = req.params;

      // GET ORDER BY REFERENCE ID
      const order = await orderService.getOrderByReferenceIdWithRelations(referenceId);

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

      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const existingOrder = await orderService.getOrderById(id as UUID);

      if (existingOrder.createdById && existingOrder.createdById !== user.id) {
        throw new ForbiddenError('You do not have permission to update this order');
      }

      // UPDATE ORDER
      const updatedOrder = await orderService.updateOrder(id as UUID, order, {
        createdById: user.id,
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

  // DELETE ORDER
  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const existingOrder = await orderService.getOrderById(id as UUID);

      if (existingOrder.createdById && existingOrder.createdById !== user.id) {
        throw new ForbiddenError('You do not have permission to delete this order');
      }

      const deletedOrder = await orderService.deleteOrder(id as UUID);

      return res.status(200).json({
        message: 'Order deleted successfully',
        data: deletedOrder,
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
