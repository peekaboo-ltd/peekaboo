import { FindOptionsWhere, Repository } from 'typeorm';
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
import { AuditLogService } from './auditLog.service';
import { OrderActivityService } from './orderActivity.service';
import { OrderActivity } from '../entities/orderActivity.entity';
import { Request } from 'express';

export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly conversationService: ConversationService;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly userRepository: Repository<User>;
  private readonly userService: UserService;
  private readonly auditLogService: AuditLogService;
  private readonly orderActivityService: OrderActivityService;
  private readonly orderActivityRepository: Repository<OrderActivity>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.conversationService = new ConversationService();
    this.orderAssignmentService = new OrderAssignmentService();
    this.userRepository = AppDataSource.getRepository(User);
    this.userService = new UserService();
    this.auditLogService = new AuditLogService();
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
  }): Promise<Order> {
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
      status: OrderStatus.CREATED,
      initialFee: 1500,
    });

    // CREATE ORDER STATUS
    await this.orderActivityService.createOrderActivity({
      orderId: createdOrder.id,
      status: OrderStatus.CREATED,
      createdById: createdOrder?.createdById,
    });

    return createdOrder;
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

    return this.orderRepository.save({
      ...orderExists,
      ...order,
    });
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
    if (orderExists?.conversation) {
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
    
    const { page = 0, size = 10, senderId, recipientId, status } = query;

    let condition: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] = {};

    if (senderId) {
      condition.senderId = senderId as UUID;
    }

    if (recipientId) {
      condition.recipientId = recipientId as UUID;
    }

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    // GET PAGINATION
    const orders = await this.orderRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
        recipient: true,
        sender: true,
        activities: true,
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
