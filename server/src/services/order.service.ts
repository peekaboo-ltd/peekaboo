import { FindOptionsWhere, Repository, ILike } from 'typeorm';
import { Order } from '../entities/order.entity';
import { AppDataSource } from '../data-source';
import { generateReferenceNumber } from '../helpers/string.helper';
import { UUID } from '../types';
import { NotFoundError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import {
  OrderAssignmentStatus,
  OrderStatus,
} from '../constants/order.constants';
import { ConversationService } from './conversation.service';
import { sendMessage } from '../helpers/whatsapp.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { OrderAssignmentService } from './orderAssignment.service';
import { AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { OrderActivityService } from './orderActivity.service';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { OrderActivity } from '../entities/orderActivity.entity';

export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly userRepository: Repository<User>;
  private readonly userService: UserService;
  private readonly orderActivityService: OrderActivityService;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderAssignmentService = new OrderAssignmentService();
    this.userRepository = AppDataSource.getRepository(User);
    this.userService = new UserService();
    this.orderActivityService = new OrderActivityService();
  }

  // CREATE ORDER
  async createOrder(order: Partial<Order>): Promise<Order> {
    // GENERATE REFERENCE ID
    let referenceId: string = generateReferenceNumber({
      prefix: 'P',
      length: 6,
    });

    // CHECK IF REFERENCE ID IS UNIQUE
    while (await this.getOrderByReferenceId(referenceId)) {
      referenceId = generateReferenceNumber({
        prefix: 'P',
        length: 6,
      });
    }

    // SET REFERENCE ID
    order.referenceId = referenceId;

    // CREATE ORDER
    const createdOrder = await this.orderRepository.save(order);

    // CREATE ORDER STATUS
    await this.orderActivityService.createOrderActivity({
      orderId: createdOrder.id,
      status: OrderStatus.CREATED,
      createdById: createdOrder?.createdById,
    });

    return createdOrder;
  }

  // CREATE PUBLIC ORDER
  async createPublicOrder({
    senderPhoneNumber,
    recipientPhoneNumber,
  }: {
    senderPhoneNumber: string;
    recipientPhoneNumber: string;
  }): Promise<{ order: Order; auth: { token: string; user: User } }> {
    // GENERATE REFERENCE ID
    let referenceId: string = generateReferenceNumber({
      prefix: 'P',
      length: 6,
    });

    // CHECK IF REFERENCE ID IS UNIQUE
    while (await this.getOrderByReferenceId(referenceId)) {
      referenceId = generateReferenceNumber({
        prefix: 'P',
        length: 6,
      });
    }

    let sender = await this.userRepository.findOne({
      where: { phoneNumber: senderPhoneNumber },
    });

    if (!sender) {
      sender = await this.userService.createUser({
        phoneNumber: senderPhoneNumber,
      });
    }

    let recipient = await this.userRepository.findOne({
      where: { phoneNumber: recipientPhoneNumber },
    });

    if (!recipient) {
      recipient = await this.userService.createUser({
        phoneNumber: recipientPhoneNumber,
      });
    }

    // CREATE ORDER
    const createdOrder = await this.orderRepository.save({
      referenceId,
      senderId: sender?.id,
      recipientId: recipient?.id,
      createdById: sender?.id,
      initialFee: 1500,
    });

    // CREATE ORDER STATUS
    await this.orderActivityService.createOrderActivity({
      orderId: createdOrder.id,
      status: OrderStatus.CREATED,
      createdById: createdOrder?.createdById,
    });

    // GENERATE AUTHENTICATION TOKEN FOR THE SENDER
    const token = jwt.sign(
      { id: sender.id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    // FETCH COMPLETE USER DETAILS WITH ROLES
    const userWithRoles = await this.userService.getUserById(sender.id);

    // RETURN ORDER AND AUTH DATA
    return {
      order: createdOrder,
      auth: {
        token,
        user: userWithRoles,
      },
    };
  }

  // GET ORDER BY REFERENCE ID
  async getOrderByReferenceId(referenceId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { referenceId },
    });
  }

  // GET ORDER BY ID
  async getOrderById(id: UUID): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
        recipient: true,
        sender: true,
        conversation: {
          recipient: true,
        },
        activities: true,
        assignments: {
          assignedTo: true,
          createdBy: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.ORDER,
      });
    }

    return order;
  }

  // CANCEL ORDER
  async cancelOrder(id: UUID, createdById?: UUID): Promise<Order> {
    const order = await this.getOrderById(id);

    await this.orderActivityService.createOrderActivity({
      orderId: order.id,
      status: OrderStatus.CANCELLED,
      createdById: createdById || order?.createdById,
    });

    await this.orderRepository.save(order);

    return order;
  }

  /**
   * UPDATE ORDER
   * @param id - Order ID
   * @param order - Order data to update
   * @returns Updated order
   */
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER,
    getEntityId: (args) => args[0],
    getEntity: (args) => args[1],
    getUserId: (args) => args[2]?.createdById || args[1]?.createdById,
  })
  async updateOrder(
    id: UUID,
    order: Partial<Order>,
    { createdById }: { createdById?: UUID }
  ): Promise<Order> {
    // CHECK IF ORDER EXISTS
    const orderExists = await this.getOrderById(id);

    const updatedOrder = await this.orderRepository.save({
      ...orderExists,
      ...order,
    });

    if (
      (order?.locationTo || order?.locationFrom) &&
      orderExists?.activities?.shift()?.status === OrderStatus.CREATED
    ) {
      this.orderActivityService.createOrderActivity({
        orderId: updatedOrder.id,
        status: OrderStatus.PENDING,
        createdById: createdById || orderExists?.createdById,
      });
    }

    return updatedOrder;
  }

  // GET ORDER BY CONVERSATION ID
  async getOrderByConversationId(conversationId: UUID): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { conversationId },
      relations: {
        recipient: true,
        createdBy: true,
        sender: true,
      },
    });
  }

  // ACCEPT ORDER
  async acceptOrder(id: UUID, createdById?: UUID): Promise<Order> {
    const orderExists = await this.getOrderById(id);

    // CREATE ORDER ACTIVITY
    await this.orderActivityService.createOrderActivity({
      orderId: orderExists.id,
      status: OrderStatus.ACCEPTED,
      createdById: createdById || orderExists?.createdById,
    });

    // CREATE ORDER ASSIGNMENT
    const orderAssignment =
      await this.orderAssignmentService.createOrderAssignment({
        orderId: orderExists.id,
        status: OrderAssignmentStatus.PENDING,
      });

    // UPDATE CONVERSATION STEP
    if (orderExists?.conversation && orderExists?.conversation?.recipient?.phoneNumber) {
      // SEND MESSAGE TO THE CONVERSATION RECIPIENT
      await sendMessage({
        phoneNumber: orderExists?.conversation?.recipient?.phoneNumber,
        type: 'text',
        message: `The recipient has accepted the order and you have been assigned a rider. Please contact them via: ${orderAssignment?.assignedTo?.phoneNumber?.replace(
          '25',
          ''
        )}`,
      });
    }

    return orderExists;
  }

  // FETCH ORDERS
  async fetchOrders(query: Request['query']): Promise<Pagination<Order>> {
    const {
      page = 0,
      size = 10,
      senderId,
      recipientId,
      createdById,
      status,
      statusGroup,
      referenceId,
    } = query as Request['query'] & {
      status?: string;
      statusGroup?: 'recent' | 'pending' | 'active' | 'completed';
      referenceId?: string;
    };

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const needsQueryBuilder = Boolean(status || statusGroup || referenceId);

    // Use query builder when filtering by latest status / statusGroup or referenceId search
    if (needsQueryBuilder) {
      const qb = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.createdBy', 'createdBy')
        .leftJoinAndSelect('order.recipient', 'recipient')
        .leftJoinAndSelect('order.sender', 'sender')
        .leftJoinAndSelect('order.activities', 'activities')
        .leftJoinAndSelect('order.assignments', 'assignments')
        .leftJoinAndSelect('assignments.assignedTo', 'assignedTo')
        .leftJoinAndSelect('assignments.createdBy', 'assignmentCreatedBy')
        .leftJoin(OrderActivity, 'latestActivity', 'latestActivity.orderId = order.id')
        .andWhere((subQb) => {
          const subQuery = subQb
            .subQuery()
            .select('MAX(sub.createdAt)')
            .from(OrderActivity, 'sub')
            .where('sub.orderId = order.id')
            .getQuery();
          return 'latestActivity.createdAt = ' + subQuery;
        })
        .distinct(true);

      if (senderId) qb.andWhere('order.senderId = :senderId', { senderId });
      if (recipientId) qb.andWhere('order.recipientId = :recipientId', { recipientId });
      if (createdById) qb.andWhere('order.createdById = :createdById', { createdById });

      if (referenceId) {
        qb.andWhere('order.referenceId ILIKE :referenceId', {
          referenceId: `%${referenceId}%`,
        });
      }

      if (statusGroup) {
        if (statusGroup === 'recent') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          qb.andWhere('order.createdAt >= :sevenDaysAgo', { sevenDaysAgo });
        } else {
          const statusGroups: Record<string, OrderStatus[]> = {
            pending: [OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.CONFIRMED],
            active: [
              OrderStatus.ACCEPTED,
              OrderStatus.PAID,
              OrderStatus.ACTIVE,
              OrderStatus.IN_TRANSIT,
            ],
            completed: [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
          };
          const statuses = statusGroups[statusGroup] || [];
          if (statuses.length > 0) {
            qb.andWhere('latestActivity.status IN (:...statuses)', { statuses });
          }
        }
      }

      if (status) {
        qb.andWhere('latestActivity.status = :status', { status });
      }

      qb.orderBy('order.createdAt', 'DESC').skip(skip).take(take);

      const orders = await qb.getManyAndCount();

      return getPagingData({
        data: orders,
        page: Number(page),
        size: Number(size),
      });
    }

    // Default (simple) path
    let condition: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] = {};

    if (senderId) condition.senderId = senderId as UUID;
    if (recipientId) condition.recipientId = recipientId as UUID;
    if (createdById) condition.createdById = createdById as UUID;
    if (referenceId) condition.referenceId = ILike(`%${referenceId}%`);

    const orders = await this.orderRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
        recipient: true,
        sender: true,
        activities: true,
        assignments: {
          assignedTo: true,
          createdBy: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({
      data: orders,
      page: Number(page),
      size: Number(size),
    });
  }
}
