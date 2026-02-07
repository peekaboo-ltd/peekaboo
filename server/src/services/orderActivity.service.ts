import { FindOptionsWhere, Repository } from 'typeorm';
import { OrderActivity } from '../entities/orderActivity.entity';
import { AppDataSource } from '../data-source';
import { Order } from '../entities/order.entity';
import { NotFoundError } from '../helpers/errors.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { Request } from 'express';
import { UUID } from '../types';
import { AuditUpdate } from '../decorators/auditLog.decorator';
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

    const activity = await this.orderActivityRepository.save(orderStatus);

    // Send order status email for key status changes (non-blocking)
    const statusStr = orderStatus.status as string;
    if (
      statusStr &&
      ORDER_STATUS_MESSAGES[statusStr] &&
      ['PAID'].includes(statusStr)
    ) {
      const statusMessage = ORDER_STATUS_MESSAGES[statusStr];

      if (order.sender?.email) {
        this.emailService
          .sendOrderStatusEmail({
            userName: order?.sender?.name || '',
            userEmail: order?.sender?.email || '',
            orderReference: order?.referenceId || '',
            status: statusStr,
            statusMessage,
          })
          .catch(() => {});
      }
    }

    return activity;
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

    return this.orderActivityRepository.save({
      ...orderActivityExists,
      ...orderStatus,
    });
  }
}
