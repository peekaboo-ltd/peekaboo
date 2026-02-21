import { FindOptionsWhere, Repository } from 'typeorm';
import { OrderActivity } from '../entities/orderActivity.entity';
import { AppDataSource } from '../data-source';
import { Order } from '../entities/order.entity';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../helpers/errors.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { Request } from 'express';
import { UUID } from '../types';
import { AuditCreate, AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import { OrderStatus } from '../constants/order.constants';
import { EmailService } from '../integrations/emails/email.service';

const ORDER_STATUS_MESSAGES: Record<string, string> = {
  [OrderStatus.PAID]:
    'Your payment has been received and your order is being processed.',
  [OrderStatus.CONFIRMED]: 'Your order has been confirmed by the rider.',
  [OrderStatus.ACTIVE]: 'Your order is now active and being processed.',
  [OrderStatus.IN_TRANSIT]: 'Your package is on the way!',
  [OrderStatus.DELIVERED]: 'Your package has been delivered.',
  [OrderStatus.COMPLETED]:
    'Your order has been completed. Thank you for using Peekaboo!',
};

export class OrderActivityService {
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly orderRepository: Repository<Order>;
  private readonly emailService: EmailService;

  constructor() {
    this.orderActivityRepository = AppDataSource.getRepository(OrderActivity);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.emailService = new EmailService();
  }

  // CREATE ORDER STATUS
  @AuditCreate({
    entityType: AuditLogEntityTypes.ORDER_STATUS,
    getUserId: (args) => args[0]?.createdById,
  })
  async createOrderActivity(
    orderStatus: Partial<OrderActivity>,
  ): Promise<OrderActivity> {
    // CHECK IF ORDER EXISTS
    const order = await this.orderRepository.findOne({
      where: { id: orderStatus?.orderId },
      relations: { sender: true },
    });
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // CHECK IF ACTIVITY FOR THIS STATUS ALREADY EXISTS TO AVOID DUPLICATES
    const existingActivity = await this.orderActivityRepository.findOne({
      where: {
        orderId: orderStatus?.orderId,
        status: orderStatus?.status as OrderStatus,
      },
    });

    if (existingActivity) {
      await this.orderRepository.update(order.id, {
        status: orderStatus.status as OrderStatus,
      });
      return existingActivity;
    }

    const activity = await this.orderActivityRepository.save(orderStatus);

    order.status = orderStatus?.status as OrderStatus;
    await this.orderRepository.save(order);

    // Send order status email for key status changes (non-blocking)
    const statusStr = orderStatus.status as string;
    if (
      statusStr &&
      ORDER_STATUS_MESSAGES[statusStr] &&
      ['PAID'].includes(statusStr)
    ) {
      const statusMessage = ORDER_STATUS_MESSAGES[statusStr];
      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
      const trackingUrl = frontendUrl
        ? `${frontendUrl}/p/orders/${order.id}/tracking`
        : undefined;

      if (order.sender?.email) {
        this.emailService
          .sendOrderStatusEmail({
            userName: order?.sender?.name || '',
            userEmail: order?.sender?.email || '',
            orderReference: order?.referenceId || '',
            status: statusStr,
            statusMessage,
            trackingUrl,
          })
          .catch(() => {});
      }
    }

    return activity;
  }

  private async getLatestActivityByOrderId(
    orderId: UUID,
  ): Promise<OrderActivity | null> {
    return this.orderActivityRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  private async assertRiderCanUpdateOrder(
    order: Order,
    actorId: UUID,
    isAdmin?: boolean,
  ): Promise<void> {
    if (isAdmin) {
      return;
    }

    const hasActiveAssignment = (order.assignments || []).some(
      (assignment) => assignment.assignedToId === actorId && assignment.status === 'ACTIVE',
    );

    if (!hasActiveAssignment) {
      throw new ForbiddenError('Only the assigned rider can update this order');
    }
  }

  private async sendDispatchEmails(order: Order): Promise<void> {
    const recipients = new Map<string, { name?: string; email?: string }>();

    if (order.sender?.email) {
      recipients.set(order.sender.id, {
        name: order.sender.name,
        email: order.sender.email,
      });
    }

    if (order.recipient?.email) {
      recipients.set(order.recipient.id, {
        name: order.recipient.name,
        email: order.recipient.email,
      });
    }

    if (order.createdBy?.email) {
      recipients.set(order.createdBy.id, {
        name: order.createdBy.name,
        email: order.createdBy.email,
      });
    }

    const emailPromises = Array.from(recipients.values()).map((recipient) => {
      if (!recipient.email) {
        return Promise.resolve();
      }

      return this.emailService.sendOrderDispatchedEmail({
        userName: recipient.name || '',
        userEmail: recipient.email,
        orderReference: order.referenceId || '',
        trackingId: order.trackingId || '',
      });
    });

    await Promise.allSettled(emailPromises);
  }

  async confirmOrderDispatch({
    orderId,
    trackingId,
    actorId,
    isAdmin,
  }: {
    orderId: UUID;
    trackingId: string;
    actorId: UUID;
    isAdmin?: boolean;
  }): Promise<{ confirmed: OrderActivity; inTransit: OrderActivity }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        sender: true,
        recipient: true,
        createdBy: true,
        assignments: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await this.assertRiderCanUpdateOrder(order, actorId, isAdmin);

    if (!trackingId?.trim()) {
      throw new ValidationError('Tracking ID is required');
    }

    if ((order.trackingId || '').toLowerCase() !== trackingId.trim().toLowerCase()) {
      throw new ValidationError('Invalid tracking ID provided');
    }

    const existingConfirmed = await this.orderActivityRepository.findOne({
      where: { orderId, status: OrderStatus.CONFIRMED },
    });

    const existingInTransit = await this.orderActivityRepository.findOne({
      where: { orderId, status: OrderStatus.IN_TRANSIT },
    });

    const confirmed =
      existingConfirmed ||
      (await this.orderActivityRepository.save({
        orderId,
        status: OrderStatus.CONFIRMED,
        createdById: actorId,
      }));

    const inTransit =
      existingInTransit ||
      (await this.orderActivityRepository.save({
        orderId,
        status: OrderStatus.IN_TRANSIT,
        createdById: actorId,
      }));

    await this.orderRepository.update(orderId, { status: OrderStatus.IN_TRANSIT });

    if (!existingInTransit) {
      this.sendDispatchEmails(order).catch(() => {});
    }

    return { confirmed, inTransit };
  }

  async markOrderCompleted({
    orderId,
    actorId,
    isAdmin,
  }: {
    orderId: UUID;
    actorId: UUID;
    isAdmin?: boolean;
  }): Promise<OrderActivity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { assignments: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await this.assertRiderCanUpdateOrder(order, actorId, isAdmin);

    const latestActivity = await this.getLatestActivityByOrderId(orderId);

    if (!latestActivity || latestActivity.status !== OrderStatus.IN_TRANSIT) {
      throw new ValidationError('Only orders in transit can be marked as completed');
    }

    const existing = await this.orderActivityRepository.findOne({
      where: { orderId, status: OrderStatus.COMPLETED },
    });

    if (existing) {
      await this.orderRepository.update(orderId, { status: OrderStatus.COMPLETED });
      return existing;
    }

    const completedActivity = await this.orderActivityRepository.save({
      orderId,
      status: OrderStatus.COMPLETED,
      createdById: actorId,
    });

    await this.orderRepository.update(orderId, { status: OrderStatus.COMPLETED });

    return completedActivity;
  }

  // FETCH ORDER STATUSES
  async fetchOrderActivities({
    params,
  }: {
    params: Request['query'];
  }): Promise<Pagination<OrderActivity>> {
    const { page = 0, size = 10, orderId } = params;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    let condition:
      | FindOptionsWhere<OrderActivity>
      | FindOptionsWhere<OrderActivity>[] = {};

    if (orderId) {
      condition.orderId = orderId as UUID;
    }

    const orderActivities = await this.orderActivityRepository.findAndCount({
      where: condition,
      skip,
      take,
      order: { updatedAt: 'DESC' },
    });

    return getPagingData({
      data: orderActivities,
      page: Number(page),
      size: Number(size),
    });
  }

  // UPDATE ORDER STATUS
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER_STATUS,
    getEntityId: (args) => args[0],
    getEntity: (args) => args[1],
    getUserId: (args) => args[2] || args[1]?.createdById,
  })
  async updateOrderActivity(
    id: UUID,
    orderStatus: Partial<OrderActivity>,
    { createdById }: { createdById?: UUID },
  ): Promise<OrderActivity> {
    const orderActivityExists = await this.orderActivityRepository.findOne({
      where: { id },
    });
    if (!orderActivityExists) {
      throw new NotFoundError('Order activity not found');
    }

    const orderActivity = await this.orderActivityRepository.save({
      ...orderActivityExists,
      ...orderStatus,
    });

    await this.orderRepository.update(orderActivity.orderId, {
      status: orderStatus.status as OrderStatus,
    });

    return orderActivity;
  }
}
