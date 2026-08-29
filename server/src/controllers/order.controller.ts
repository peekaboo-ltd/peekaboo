import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { UUID } from '../types';
import { PersonalDeliveryQuoteService } from '../services/personalDeliveryQuote.service';
import { Order } from '../entities/order.entity';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../types/auth.types';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../helpers/errors.helper';
import { RoleTypes } from '../constants/role.constants';
import { PreferredContactMethod } from '../constants/order.constants';

const orderService = new OrderService();
const personalDeliveryQuoteService = new PersonalDeliveryQuoteService();
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL_MAX_LENGTH = 255;

const normalizePreferredContactMethod = (
  value: unknown
): PreferredContactMethod | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (
    typeof value !== 'string' ||
    !Object.values(PreferredContactMethod).includes(
      value as PreferredContactMethod
    )
  ) {
    throw new ValidationError(
      `preferredContactMethod must be one of ${Object.values(
        PreferredContactMethod
      ).join(', ')}`
    );
  }
  return value as PreferredContactMethod;
};

const normalizeContactEmail = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ValidationError('contactEmail must be a string');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > CONTACT_EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
    throw new ValidationError('contactEmail must be a valid email address');
  }
  return trimmed;
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
  async quotePublicOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.body?.orderId as UUID | undefined;
      const order = orderId ? await orderService.getOrderById(orderId) : null;
      const quote = await personalDeliveryQuoteService.quote({
        pickup: order?.locationFrom || req.body?.locationFrom,
        dropoff: order?.locationTo || req.body?.locationTo,
      });
      const updatedOrder = orderId
        ? await orderService.applyPublicPersonalQuote({ orderId, ...quote })
        : null;
      return res.status(200).json({
        message: 'Delivery quote calculated successfully',
        data: { quote, ...(updatedOrder ? { order: updatedOrder } : {}) },
      });
    } catch (error) {
      next(error);
    }
  },

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
      if (existingOrder.orderSource === 'whatsapp_personal') {
        throw new ForbiddenError('WhatsApp booking details can only be changed through the active Flow');
      }

      // Public clients may move locations and set contact preferences. Fees
      // are written only by POST /orders/public/quote.
      const allowedFields: (keyof Order)[] = [
        'locationFrom',
        'locationTo',
        'preferredContactMethod',
        'contactEmail',
      ];
      const sanitized: Partial<Order> = {};
      for (const key of allowedFields) {
        if (order?.[key] !== undefined) {
          (sanitized as Record<string, unknown>)[key] = order[key];
        }
      }

      if ((sanitized.locationFrom || sanitized.locationTo) && !existingOrder.isBusinessOrder) {
        sanitized.initialFee = null;
        sanitized.finalFee = null;
        sanitized.quotedAmount = null;
        sanitized.quotedDistanceKm = null;
        sanitized.quotedDurationMinutes = null;
        sanitized.quoteConfirmedAt = null;
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

      // There is no schema layer on this route, so the enum and the address are
      // checked here rather than persisted as whatever was sent.
      if (sanitized.preferredContactMethod !== undefined) {
        sanitized.preferredContactMethod = normalizePreferredContactMethod(
          sanitized.preferredContactMethod
        );
      }
      if (sanitized.contactEmail !== undefined) {
        sanitized.contactEmail = normalizeContactEmail(sanitized.contactEmail);
      }

      // A stored preference we cannot act on is worse than none: EMAIL needs an
      // address, either arriving in this request or already on the order.
      if (sanitized.preferredContactMethod === PreferredContactMethod.EMAIL) {
        const resolvedEmail =
          sanitized.contactEmail !== undefined
            ? sanitized.contactEmail
            : existingOrder.contactEmail;
        if (!resolvedEmail) {
          throw new ValidationError(
            'contactEmail is required when preferredContactMethod is EMAIL'
          );
        }
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
