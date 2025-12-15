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
import { WhatsAppNotificationService } from './whatsappNotification.service';

export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly conversationService: ConversationService;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly userRepository: Repository<User>;
  private readonly userService: UserService;
  private readonly auditLogService: AuditLogService;
  private readonly orderActivityService: OrderActivityService;
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly whatsappNotificationService: WhatsAppNotificationService;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.conversationService = new ConversationService();
    this.orderAssignmentService = new OrderAssignmentService();
    this.userRepository = AppDataSource.getRepository(User);
    this.userService = new UserService();
    this.auditLogService = new AuditLogService();
    this.orderActivityService = new OrderActivityService();
    this.whatsappNotificationService = new WhatsAppNotificationService();
  }

  // CREATE ORDER
  async createOrder(order: Partial<Order>, assignedToId?: UUID): Promise<Order> {
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

    // AUTO-ASSIGN rider (explicit rider if provided, otherwise first available)
    await this.orderAssignmentService.createOrderAssignment({
      orderId: createdOrder.id,
      assignedToId,
      status: OrderAssignmentStatus.PENDING,
    });

    return createdOrder;
  }

  // CREATE PUBLIC ORDER
  async createPublicOrder({
    senderPhoneNumber,
    recipientPhoneNumber,
    pickupLocation,
    deliveryLocation,
    distance,
    finalFee,
    assignedToId,
  }: {
    senderPhoneNumber: string;
    recipientPhoneNumber: string;
    pickupLocation?: { address: string; lat: number; lng: number };
    deliveryLocation?: { address: string; lat: number; lng: number };
    distance?: number;
    finalFee?: number;
    assignedToId?: UUID;
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

    // Check if sender exists
    let sender = await this.userRepository.findOne({
      where: { phoneNumber: senderPhoneNumber },
    });

    let senderIsNew = false;
    if (!sender) {
      sender = await this.whatsappNotificationService.createUserWithCredentials(
        senderPhoneNumber
      );
      senderIsNew = true;
    }

    // Check if recipient exists
    let recipient = await this.userRepository.findOne({
      where: { phoneNumber: recipientPhoneNumber },
    });

    let recipientIsNew = false;
    if (!recipient) {
      recipient = await this.whatsappNotificationService.createUserWithCredentials(
        recipientPhoneNumber
      );
      recipientIsNew = true;
    }

    // CREATE ORDER
    const createdOrder = await this.orderRepository.save({
      referenceId,
      senderId: sender?.id,
      recipientId: recipient?.id,
      createdById: sender?.id,
      status: OrderStatus.CREATED,
      initialFee: 1500,
      finalFee: finalFee || 1500,
      pickupLocation: pickupLocation?.address,
      pickupCoordinates: pickupLocation ? `${pickupLocation.lat},${pickupLocation.lng}` : undefined,
      deliveryLocation: deliveryLocation?.address,
      deliveryCoordinates: deliveryLocation ? `${deliveryLocation.lat},${deliveryLocation.lng}` : undefined,
      distance: distance,
    });

    // CREATE ORDER STATUS
    await this.orderActivityService.createOrderActivity({
      orderId: createdOrder.id,
      status: OrderStatus.CREATED,
      createdById: createdOrder?.createdById,
    });

    // AUTO-ASSIGN rider (explicit rider if provided, otherwise first available)
    await this.orderAssignmentService.createOrderAssignment({
      orderId: createdOrder.id,
      assignedToId,
      status: OrderAssignmentStatus.PENDING,
    });

    // Get full order with relations for WhatsApp messages
    const orderWithRelations = await this.getOrderById(createdOrder.id);

    // Send order confirmations via WhatsApp
    await this.whatsappNotificationService.sendOrderConfirmationToSender(orderWithRelations);
    await this.whatsappNotificationService.sendOrderNotificationToRecipient(orderWithRelations);

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
        activities: true,
        assignments: {
          assignedTo: true,
        },
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
    
    const { page = 0, size = 10, senderId, recipientId, status, search } = query;

    let condition: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] = {};

      // If both senderId and recipientId are provided with same value, use OR condition
      // This allows customers to see orders where they are either sender OR recipient
      if (senderId && recipientId && senderId === recipientId) {
        condition = [
          { senderId: senderId as UUID },
          { recipientId: recipientId as UUID }
        ];
      } else {
        if (senderId) {
          condition.senderId = senderId as UUID;
        }
        if (recipientId) {
          condition.recipientId = recipientId as UUID;
        }
    }

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    // Build where condition
    const whereCondition: any = condition;

    // GET PAGINATION
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
      .leftJoinAndSelect('order.recipient', 'recipient')
      .leftJoinAndSelect('order.sender', 'sender')
      .leftJoinAndSelect('order.activities', 'activities')
      .leftJoinAndSelect('order.assignments', 'assignments')
      .leftJoinAndSelect('assignments.assignedTo', 'assignedTo')
      .skip(skip)
      .take(take)
      .orderBy('order.createdAt', 'DESC');

    // Apply sender/recipient filters
    if (senderId && recipientId && senderId === recipientId) {
      queryBuilder.where('(order.senderId = :userId OR order.recipientId = :userId)', { userId: senderId });
    } else {
      if (senderId) {
        queryBuilder.andWhere('order.senderId = :senderId', { senderId });
      }
      if (recipientId) {
        queryBuilder.andWhere('order.recipientId = :recipientId', { recipientId });
      }
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere('order.referenceId ILIKE :search', { search: `%${search}%` });
    }

    // Apply status filter - need to filter by activities
    if (status) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb.subQuery()
          .select('act.orderId')
          .from('order_activities', 'act')
          .where('act.orderId = order.id')
          .andWhere('act.status = :status')
          .orderBy('act.createdAt', 'DESC')
          .limit(1)
          .getQuery();
        return `order.id IN ${subQuery}`;
      }).setParameter('status', status);
    }

    const [orders, count] = await queryBuilder.getManyAndCount();

    return {
      rows: orders,
      totalCount: count,
      totalPages: Math.ceil(count / Number(size)),
      currentPage: Number(page),
    };
  }
}
