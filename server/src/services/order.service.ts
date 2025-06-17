import { FindOptionsWhere, Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { AppDataSource } from "../data-source";
import { generateReferenceNumber } from "../helpers/string.helper";
import { UUID } from "../types";
import { NotFoundError } from "../helpers/errors.helper";
import { LogReferenceTypes } from "../constants/logs.constants";
import {
  OrderAssignmentStatus,
  OrderStatus,
} from "../constants/order.constants";
import { ConversationStep } from "../constants/conversation.constants";
import { ConversationService } from "./conversation.service";
import { sendMessage } from "../helpers/whatsapp.helper";
import {
  getPagination,
  getPagingData,
  Pagination,
} from "../helpers/pagination.helper";
import { OrderAssignmentService } from "./orderAssignment.service";
import { AuditUpdate } from "../decorators/auditLog.decorator";
import { AuditLogEntityTypes } from "../constants/auditLog.constants";

export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly conversationService: ConversationService;
  private readonly orderAssignmentService: OrderAssignmentService;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.conversationService = new ConversationService();
    this.orderAssignmentService = new OrderAssignmentService();
  }

  // CREATE ORDER
  async createOrder(order: Partial<Order>): Promise<Order> {
    // GENERATE REFERENCE ID
    let referenceId: string = generateReferenceNumber({
      prefix: 'O',
      length: 6,
    });

    // CHECK IF REFERENCE ID IS UNIQUE
    while (await this.getOrderByReferenceId(referenceId)) {
      referenceId = generateReferenceNumber({
        prefix: 'O',
        length: 6,
      });
    }

    // SET REFERENCE ID
    order.referenceId = referenceId;

    // CREATE ORDER
    const createdOrder = await this.orderRepository.save(order);

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

    order.status = OrderStatus.CANCELLED;

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
    getUserId: (args) => args[2] || args[1]?.createdById,
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
      },
    });
  }

  // ACCEPT ORDER
  async acceptOrder(id: UUID, createdById?: UUID): Promise<Order> {
    const orderExists = await this.getOrderById(id);

    // CREATE ORDER ACTIVITY
    orderExists.status = OrderStatus.ACCEPTED;
    await this.orderRepository.save(orderExists);

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
  async fetchOrders({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Order> | FindOptionsWhere<Order>[];
  }): Promise<Pagination> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const orders = await this.orderRepository.findAndCount({
      where: condition,
      skip,
      take,
    });

    return getPagingData({
      page,
      size,
      data: orders,
    });
  }
}
