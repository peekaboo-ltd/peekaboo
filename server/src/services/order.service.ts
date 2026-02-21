import { FindOptionsWhere, Repository, ILike, In } from 'typeorm';
import { Order } from '../entities/order.entity';
import { AppDataSource } from '../data-source';
import { generateReferenceNumber } from '../helpers/string.helper';
import { UUID } from '../types';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
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
import { AuditCreate, AuditUpdate, AuditDelete } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { OrderActivityService } from './orderActivity.service';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { OrderActivity } from '../entities/orderActivity.entity';
import { OrganizationService } from './organization.service';
import { OrganizationBillingService } from './organizationBilling.service';
import { EmailService } from '../integrations/emails/email.service';
import { OrderAssignment } from '../entities/orderAssignment.entity';
import { Batch } from '../entities/batch.entity';
import { BatchStatus } from '../constants/batch.constants';
import { validateAndFormatPhoneNumber } from '../helpers/phone.helper';
import {
  BulkImportRequest,
  BulkImportResponse,
  BulkImportRowInput,
  BulkImportRowResult,
} from '../types/orderImport.types';

export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly userRepository: Repository<User>;
  private readonly userService: UserService;
  private readonly orderActivityService: OrderActivityService;
  private readonly organizationService: OrganizationService;
  private readonly organizationBillingService: OrganizationBillingService;
  private readonly emailService: EmailService;
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly orderAssignmentRepository: Repository<OrderAssignment>;
  private readonly batchRepository: Repository<Batch>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderAssignmentService = new OrderAssignmentService();
    this.userRepository = AppDataSource.getRepository(User);
    this.userService = new UserService();
    this.orderActivityService = new OrderActivityService();
    this.organizationService = new OrganizationService();
    this.organizationBillingService = new OrganizationBillingService();
    this.emailService = new EmailService();
    this.orderActivityRepository = AppDataSource.getRepository(OrderActivity);
    this.orderAssignmentRepository = AppDataSource.getRepository(OrderAssignment);
    this.batchRepository = AppDataSource.getRepository(Batch);
  }

  // GET ORDER BY ID (needed by audit decorators)
  async getEntityById(id: UUID): Promise<Order> {
    return this.getOrderById(id);
  }

  // CREATE ORDER
  @AuditCreate({
    entityType: AuditLogEntityTypes.ORDER,
    getUserId: (args) => args[0]?.createdById,
  })
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

    // CHECK IF USER BELONGS TO ORGANIZATION
    if (order.createdById) {
      const membership = await this.organizationService.getUserMembership(
        order.createdById
      );

      if (membership && membership?.organization) {
        // This is a business order
        order.organizationId = membership.organization.id;
        order.isBusinessOrder = true;

        // Apply business plan pricing if available
        if (membership?.organization?.businessPlan) {
          const businessPlan = membership.organization.businessPlan;
          order.businessPlanPrice = Number(businessPlan.pricePerOrder);
          order.initialFee = Number(businessPlan.pricePerOrder);
          order.finalFee = Number(businessPlan.pricePerOrder);
        }
      }
    }

    // CREATE ORDER
    const createdOrder = await this.orderRepository.save(order);

    // CREATE ORDER STATUS
    await this.orderActivityService.createOrderActivity({
      orderId: createdOrder.id,
      status: OrderStatus.CREATED,
      createdById: createdOrder?.createdById,
    });

    // ADD TO BILLING IF BUSINESS ORDER
    if (createdOrder.isBusinessOrder && createdOrder.organizationId) {
      await this.organizationBillingService.addOrderToBilling(
        createdOrder.id,
        Number(createdOrder.finalFee || createdOrder.initialFee)
      );
    }

    // Send order created emails (non-blocking)
    if (createdOrder.senderId) {
      const sender = await this.userRepository.findOne({
        where: { id: createdOrder.senderId },
      });
      if (sender?.email) {
        this.emailService
          .sendOrderCreatedSenderEmail({
            senderName: sender.name || '',
            senderEmail: sender.email,
            recipientPhone: '',
            orderReference: createdOrder.referenceId || '',
            fee: Number(createdOrder.initialFee || 0),
            currency: 'RWF',
          })
          .catch(() => {});
      }
    }
    if (createdOrder.recipientId) {
      const recipient = await this.userRepository.findOne({
        where: { id: createdOrder.recipientId },
      });
      if (recipient?.email) {
        this.emailService
          .sendOrderCreatedRecipientEmail({
            recipientName: recipient.name || '',
            recipientEmail: recipient.email,
            senderPhone: '',
            orderReference: createdOrder.referenceId || '',
          })
          .catch(() => {});
      }
    }

    return createdOrder;
  }

  // CREATE PUBLIC ORDER
  @AuditCreate({
    entityType: AuditLogEntityTypes.ORDER,
    getEntityId: (result) => result?.order?.id,
  })
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

  private async generateUniqueOrderReferenceId(): Promise<string> {
    let referenceId: string = generateReferenceNumber({
      prefix: 'P',
      length: 6,
    });

    while (await this.getOrderByReferenceId(referenceId)) {
      referenceId = generateReferenceNumber({
        prefix: 'P',
        length: 6,
      });
    }

    return referenceId;
  }

  private async generateUniqueBatchReferenceId(): Promise<string> {
    let referenceId = generateReferenceNumber({
      prefix: 'B',
      length: 6,
    });

    while (await this.batchRepository.findOne({ where: { referenceId } })) {
      referenceId = generateReferenceNumber({
        prefix: 'B',
        length: 6,
      });
    }

    return referenceId;
  }

  async importBulkOrders(
    payload: BulkImportRequest,
    currentUser: User,
  ): Promise<BulkImportResponse> {
    if (!payload?.rows?.length) {
      throw new ValidationError('At least one row is required for import');
    }

    const rows = payload.rows;
    const rowErrors: BulkImportResponse['errors'] = [];
    const seenProductRefs = new Set<string>();

    for (const row of rows) {
      if (!row?.rowNumber || row.rowNumber < 2) {
        rowErrors.push({
          rowNumber: row?.rowNumber || 0,
          field: 'rowNumber',
          message: 'Invalid row number',
        });
      }

      const normalizedRecipient = validateAndFormatPhoneNumber(
        row?.recipientPhoneNumber,
      );
      if (!normalizedRecipient.isValid || !normalizedRecipient.formattedNumber) {
        rowErrors.push({
          rowNumber: row.rowNumber,
          field: 'recipientPhoneNumber',
          message: normalizedRecipient.error || 'Invalid recipient phone number',
        });
      }

      if ((row.productReferenceNo || '').trim().length > 255) {
        rowErrors.push({
          rowNumber: row.rowNumber,
          field: 'productReferenceNo',
          message: 'Product reference cannot exceed 255 characters',
        });
      }

      if ((row.productName || '').trim().length > 255) {
        rowErrors.push({
          rowNumber: row.rowNumber,
          field: 'productName',
          message: 'Product name cannot exceed 255 characters',
        });
      }

      const normalizedProductRef = (row.productReferenceNo || '').trim();
      if (normalizedProductRef) {
        if (seenProductRefs.has(normalizedProductRef)) {
          rowErrors.push({
            rowNumber: row.rowNumber,
            field: 'productReferenceNo',
            message: 'Duplicate product reference in this upload',
          });
        }
        seenProductRefs.add(normalizedProductRef);
      }
    }

    if (rowErrors.length > 0) {
      throw new ValidationError('Bulk import validation failed', {
        referenceType: LogReferenceTypes.ORDER,
        referenceId: currentUser.id,
        errors: rowErrors,
      } as any);
    }

    const membership = await this.organizationService.getUserMembership(currentUser.id);
    const organizationPhone = membership?.organization?.phoneNumber?.trim();
    const senderCandidate = organizationPhone || currentUser.phoneNumber || '';
    const senderValidation = validateAndFormatPhoneNumber(senderCandidate);

    if (!senderValidation.isValid || !senderValidation.formattedNumber) {
      throw new ValidationError(
        'Unable to determine a valid sender phone number for import. Update your user or organization phone number first.',
      );
    }

    const senderPhoneNumber = senderValidation.formattedNumber;

    const result = await AppDataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const userRepository = manager.getRepository(User);
      const orderActivityRepository = manager.getRepository(OrderActivity);
      const batchRepository = manager.getRepository(Batch);

      let sender = await userRepository.findOne({
        where: { phoneNumber: senderPhoneNumber },
      });

      if (!sender) {
        sender = await userRepository.save(
          userRepository.create({ phoneNumber: senderPhoneNumber }),
        );
      }

      const batchReferenceId = await this.generateUniqueBatchReferenceId();
      const batch = await batchRepository.save(
        batchRepository.create({
          name: payload.batch?.name?.trim() || undefined,
          description: payload.batch?.description?.trim() || undefined,
          referenceId: batchReferenceId,
          createdById: currentUser.id,
          status: BatchStatus.DRAFT,
        }),
      );

      const rowResults: BulkImportRowResult[] = [];
      let createdCount = 0;
      let linkedCount = 0;

      for (const rawRow of rows) {
        const row: BulkImportRowInput = {
          rowNumber: rawRow.rowNumber,
          recipientPhoneNumber:
            validateAndFormatPhoneNumber(rawRow.recipientPhoneNumber)
              .formattedNumber || '',
          deliveryLocation: rawRow.deliveryLocation?.trim() || undefined,
          productReferenceNo: rawRow.productReferenceNo?.trim() || undefined,
          productName: rawRow.productName?.trim() || undefined,
          description: rawRow.description?.trim() || undefined,
        };

        let orderToAttach: Order | null = null;
        let rowAction: BulkImportRowResult['action'] = 'created';

        if (row.productReferenceNo) {
          const existingOrder = await orderRepository.findOne({
            where: { externalReferenceId: row.productReferenceNo },
          });
          if (existingOrder) {
            const isVisible = membership?.organizationId
              ? existingOrder.organizationId === membership.organizationId
              : existingOrder.createdById === currentUser.id;

            if (!isVisible) {
              throw new ValidationError('Bulk import validation failed', {
                referenceType: LogReferenceTypes.ORDER,
                referenceId: currentUser.id,
                errors: [
                  {
                    rowNumber: row.rowNumber,
                    field: 'productReferenceNo',
                    message:
                      'An order with this product reference exists but is outside your scope',
                  },
                ],
              } as any);
            }
            orderToAttach = existingOrder;
            rowAction = 'linked';
          }
        }

        if (!orderToAttach) {
          let recipient = await userRepository.findOne({
            where: { phoneNumber: row.recipientPhoneNumber },
          });

          if (!recipient) {
            recipient = await userRepository.save(
              userRepository.create({ phoneNumber: row.recipientPhoneNumber }),
            );
          }

          const orderReferenceId = await this.generateUniqueOrderReferenceId();

          const composedDescription = [row.productName, row.description]
            .filter(Boolean)
            .join(' - ');

          const orderPayload: Partial<Order> = {
            referenceId: orderReferenceId,
            externalReferenceId: row.productReferenceNo,
            senderId: sender.id,
            recipientId: recipient.id,
            createdById: currentUser.id,
            initialFee: 1500,
            status: OrderStatus.DRAFT,
            description: composedDescription || undefined,
            notes: row.deliveryLocation || undefined,
            batchId: batch.id,
          };

          if (membership?.organizationId) {
            orderPayload.organizationId = membership.organizationId;
            orderPayload.isBusinessOrder = true;
          }

          if (membership?.organization?.businessPlan) {
            const businessPlanPrice = Number(
              membership.organization.businessPlan.pricePerOrder,
            );
            orderPayload.businessPlanPrice = businessPlanPrice;
            orderPayload.initialFee = businessPlanPrice;
            orderPayload.finalFee = businessPlanPrice;
          }

          orderToAttach = await orderRepository.save(orderRepository.create(orderPayload));
          await orderActivityRepository.save(
            orderActivityRepository.create({
              orderId: orderToAttach.id,
              status: OrderStatus.DRAFT,
              createdById: currentUser.id,
            }),
          );
          createdCount += 1;
        } else {
          orderToAttach.batchId = batch.id;
          orderToAttach = await orderRepository.save(orderToAttach);
          linkedCount += 1;
        }

        rowResults.push({
          rowNumber: row.rowNumber,
          orderId: orderToAttach.id,
          referenceId: orderToAttach.referenceId,
          action: rowAction,
        });
      }

      return {
        summary: {
          total: rows.length,
          created: createdCount,
          linked: linkedCount,
          failed: 0,
        },
        orders: rowResults,
        batch: {
          id: batch.id,
          name: batch.name,
          referenceId: batch.referenceId,
          status: batch.status,
        },
        errors: [],
      } as BulkImportResponse;
    });

    return result;
  }

  // GET ORDER BY REFERENCE ID
  async getOrderByReferenceId(referenceId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { referenceId },
    });
  }

  // GET ORDER BY REFERENCE ID WITH RELATIONS (FOR PUBLIC ACCESS)
  async getOrderByReferenceIdWithRelations(referenceId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { referenceId },
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
    });

    if (!order) {
      throw new NotFoundError('Order not found', {
        referenceId,
        referenceType: LogReferenceTypes.ORDER,
      });
    }

    return order;
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
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER,
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1],
  })
  async cancelOrder(id: UUID, createdById?: UUID): Promise<Order> {
    const order = await this.getOrderById(id);

    await this.orderActivityService.createOrderActivity({
      orderId: order.id,
      status: OrderStatus.CANCELLED,
      createdById: createdById || order?.createdById,
    });

    await this.orderRepository.save(order);

    // Send cancellation emails (non-blocking)
    if (order.sender?.email) {
      this.emailService
        .sendOrderStatusEmail({
          userName: order.sender.name || '',
          userEmail: order.sender.email,
          orderReference: order.referenceId || '',
          status: 'CANCELLED',
          statusMessage: 'Your order has been cancelled.',
        })
        .catch(() => {});
    }
    if (order.recipient?.email) {
      this.emailService
        .sendOrderStatusEmail({
          userName: order.recipient.name || '',
          userEmail: order.recipient.email,
          orderReference: order.referenceId || '',
          status: 'CANCELLED',
          statusMessage: 'The delivery order has been cancelled.',
        })
        .catch(() => {});
    }

    return order;
  }

  // DELETE ORDER
  @AuditDelete({
    entityType: AuditLogEntityTypes.ORDER,
    getEntityId: (args) => args[0],
  })
  async deleteOrder(id: UUID): Promise<Order> {
    const order = await this.getOrderById(id);

    const latestActivity = order?.activities
      ? [...order.activities].sort(
          (a, b) =>
            new Date(b?.updatedAt ?? '').getTime() -
            new Date(a?.updatedAt ?? '').getTime()
        )[0]
      : undefined;

    const statusToValidate = latestActivity?.status ?? order.status;

    if (![OrderStatus.CREATED, OrderStatus.PENDING].includes(statusToValidate)) {
      throw new ValidationError('Only orders in CREATED or PENDING can be deleted');
    }

    await this.orderAssignmentRepository.delete({ orderId: id });
    await this.orderActivityRepository.delete({ orderId: id });
    await this.orderRepository.delete({ id });

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
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER,
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1],
  })
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
      batchId,
    } = query as Request['query'] & {
      status?: string | string[];
      statusGroup?: 'recent' | 'pending' | 'active' | 'completed';
      referenceId?: string;
    };

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const statusList = Array.isArray(status)
      ? status.flatMap((value) => value.split(','))
      : typeof status === 'string'
        ? status.split(',')
        : [];

    const normalizedStatuses = statusList
      .map((value) => value.trim())
      .filter(Boolean);

    // Default (simple) path
    let condition: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] = {};

    if (senderId) condition.senderId = senderId as UUID;
    if (recipientId) condition.recipientId = recipientId as UUID;
    if (createdById) condition.createdById = createdById as UUID;
    if (referenceId) condition.referenceId = ILike(`%${referenceId}%`);
    if (normalizedStatuses.length > 0) condition.status = In(normalizedStatuses as OrderStatus[]);
    if (batchId) condition.batchId = batchId as UUID;

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

  // FETCH ORGANIZATION ORDERS
  async fetchOrganizationOrders(
    organizationId: UUID,
    query: Request['query']
  ): Promise<Pagination<Order>> {
    const { page = 0, size = 10, status } = query;

    let condition: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] = {
      organizationId,
    };

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

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
