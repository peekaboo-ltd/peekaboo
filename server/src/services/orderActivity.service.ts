import { FindOptionsWhere, Repository } from 'typeorm';
import { OrderActivity } from '../entities/orderActivity.entity';
import { AppDataSource } from '../data-source';
import { Order } from '../entities/order.entity';
import { NotFoundError } from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { Request } from 'express';
import { UUID } from '../types';
import { AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';

export class OrderActivityService {
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly orderRepository: Repository<Order>;

  constructor() {
    this.orderActivityRepository = AppDataSource.getRepository(OrderActivity);
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  // CREATE ORDER STATUS
  async createOrderActivity(
    orderStatus: Partial<OrderActivity>
  ): Promise<OrderActivity> {
    // CHECK IF ORDER EXISTS
    const order = await this.orderRepository.findOne({
      where: { id: orderStatus?.orderId },
    });
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return this.orderActivityRepository.save(orderStatus);
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
    { createdById }: { createdById?: UUID }
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
