import { FindOptionsWhere, In, Repository } from 'typeorm';
import { OrderAssignment } from '../entities/orderAssignment.entity';
import { AppDataSource } from '../data-source';
import { getPagination, getPagingData } from '../helpers/pagination.helper';
import { Pagination } from '../helpers/pagination.helper';
import {
  OrderAssignmentStatus,
  OrderStatus,
} from '../constants/order.constants';
import { Order } from '../entities/order.entity';
import { ConflictError, NotFoundError } from '../helpers/errors.helper';
import { UserService } from './user.service';
import { RoleTypes } from '../constants/role.constants';
import { UserStatus } from '../constants/user.constants';
import { UUID } from '../types';
import { LogReferenceTypes } from '../constants/logs.constants';
import { Request } from 'express';
import { OrderActivityService } from './orderActivity.service';
import { EmailService } from '../integrations/emails/email.service';
import { AuditCreate, AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import { pushService } from './push.service';
import { PushNotificationType } from '../constants/push.constants';
import logger from '../helpers/logger.helper';

interface RiderAssignmentScope {
  riderId?: UUID;
}

export class OrderAssignmentService {
  private readonly orderAssignmentRepository: Repository<OrderAssignment>;
  private readonly orderRepository: Repository<Order>;
  private readonly userService: UserService;
  private readonly orderActivityService: OrderActivityService;
  private readonly emailService: EmailService;
  constructor() {
    this.orderAssignmentRepository =
      AppDataSource.getRepository(OrderAssignment);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.userService = new UserService();
    this.orderActivityService = new OrderActivityService();
    this.emailService = new EmailService();
  }

  // CREATE ORDER ASSIGNMENT
  @AuditCreate({
    entityType: AuditLogEntityTypes.ORDER_ASSIGNMENT,
  })
  async createOrderAssignment(
    orderAssignment: Partial<OrderAssignment>
  ): Promise<OrderAssignment> {
    // CHECK IF ORDER EXISTS
    const orderExists = await this.orderRepository.findOne({
      where: { id: orderAssignment?.orderId },
      relations: {
        assignments: true,
      },
    });

    if (!orderExists) {
      throw new NotFoundError('Order not found');
    }

    if (orderExists?.assignments?.length >= 0) {
      // CANCEL ALL OTHER ACTIVE ASSIGNMENTS
      const activeAssignments = orderExists?.assignments?.filter(
        (assignment) => assignment.status === OrderAssignmentStatus.ACTIVE
      );

      await Promise.all(
        activeAssignments.map(async (assignment) => {
          assignment.status = OrderAssignmentStatus.CANCELLED;
          await this.orderAssignmentRepository.save(assignment);

          // Notify the cancelled rider
          if (assignment.assignedToId) {
            this.sendAssignmentPush({
              userId: assignment.assignedToId,
              assignmentId: assignment.id,
              orderId: assignment.orderId,
              title: 'Assignment cancelled',
              body: `Order #${orderExists.referenceId || ''} has been reassigned.`,
            }).catch((error) =>
              logger.error('Failed to send cancellation push', error)
            );
          }
        })
      );
    }

    // CHECK IF ASSIGNED TO ID EXISTS
    let assignedToExists = await this.userService.getUserByCondition({
      id: orderAssignment?.assignedToId,
      userRoles: {
        role: {
          name: RoleTypes.RIDER,
        },
      },
      status: UserStatus.ACTIVE,
    });

    /**
     * HANDLE RIDER ASSIGNMENT
     */
    if (!assignedToExists) {
      let availableRiders = await this.userService.fetchUsers({
        page: 0,
        size: 10,
        condition: {
          userRoles: {
            role: {
              name: RoleTypes.RIDER,
            },
          },
          status: UserStatus.ACTIVE,
        },
        relations: ['userRoles.role', 'assignments'],
      });

      if (availableRiders?.rows.length === 0) {
        throw new NotFoundError('No available riders found');
      }

      // SORT BY ASSIGNMENTS
      availableRiders?.rows.sort((a, b) => {
        return a.assignments.length - b.assignments.length;
      });

      assignedToExists = availableRiders?.rows[0];
    }

    // CREATE ORDER ASSIGNMENT
    const createdOrderAssignment = await this.orderAssignmentRepository.save({
      ...orderAssignment,
      assignedToId: assignedToExists?.id,
      assignedTo: assignedToExists,
    });

    // Send rider assigned email (non-blocking)
    if (assignedToExists?.email && orderExists) {
      this.emailService
        .sendRiderAssignedEmail({
          riderName: assignedToExists.name || '',
          riderEmail: assignedToExists.email,
          orderReference: orderExists.referenceId || '',
        })
        .catch(() => {});
    }

    if (assignedToExists?.id) {
      const orderRef = orderExists.referenceId || '';
      this.sendAssignmentPush({
        userId: assignedToExists.id,
        assignmentId: createdOrderAssignment.id,
        orderId: createdOrderAssignment.orderId,
        title: `New Order #${orderRef}`,
        body: `You've been assigned order #${orderRef}. Tap to review.`,
      }).catch((error) =>
        logger.error('Failed to send assignment push', error)
      );
    }

    return createdOrderAssignment;
  }

  // FETCH ORDER ASSIGNMENTS
  async fetchOrderAssignments(
    query: Request['query'],
    scope?: RiderAssignmentScope
  ): Promise<Pagination> {
    const { page = 0, size = 10, orderId, assignedToId, status } = query;

    let condition:
      | FindOptionsWhere<OrderAssignment>
      | FindOptionsWhere<OrderAssignment>[] = {};

    if (orderId) {
      condition.orderId = orderId as UUID;
    }

    if (assignedToId) {
      condition.assignedToId = assignedToId as UUID;
    }

    if (status) {
      const normalizedStatuses = String(status)
        .split(',')
        .map((assignmentStatus) => assignmentStatus.trim())
        .filter(Boolean);

      if (normalizedStatuses.length === 1) {
        condition.status = normalizedStatuses[0] as OrderAssignmentStatus;
      }

      if (normalizedStatuses.length > 1) {
        condition.status = In(normalizedStatuses as OrderAssignmentStatus[]);
      }
    }

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const scopedCondition = condition as FindOptionsWhere<OrderAssignment>;
    if (scope?.riderId) {
      scopedCondition.assignedToId = scope.riderId;
    }

    const orderAssignments = await this.orderAssignmentRepository.findAndCount({
      where: scopedCondition,
      skip,
      take,
      relations: {
        order: true,
        assignedTo: true,
        createdBy: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return getPagingData({
      data: orderAssignments,
      page: Number(page),
      size: Number(size),
    });
  }

  // GET ORDER ASSIGNMENT BY ID
  async getOrderAssignmentById(
    id: UUID,
    scope?: RiderAssignmentScope
  ): Promise<OrderAssignment> {
    const whereCondition: FindOptionsWhere<OrderAssignment> = { id };
    if (scope?.riderId) {
      whereCondition.assignedToId = scope.riderId;
    }

    const orderAssignment = await this.orderAssignmentRepository.findOne({
      where: whereCondition,
      relations: {
        order: {
          activities: true,
        },
        assignedTo: true,
        createdBy: true,
      },
    });

    if (!orderAssignment) {
      throw new NotFoundError('Order assignment not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.ORDER_ASSIGNMENT,
      });
    }

    return orderAssignment;
  }

  // UPDATE ORDER ASSIGNMENT
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER_ASSIGNMENT,
    getEntityId: (args) => args[0],
  })
  async updateOrderAssignment(
    id: UUID,
    orderAssignment: Partial<OrderAssignment>
  ): Promise<OrderAssignment> {
    // CHECK IF ORDER ASSIGNMENT EXISTS
    const orderAssignmentExists = await this.getOrderAssignmentById(id);

    const updatedOrderAssignment = await this.orderAssignmentRepository.save({
      ...orderAssignmentExists,
      ...orderAssignment,
    });

    if (
      orderAssignmentExists?.order?.activities?.shift()?.status ===
        OrderStatus.PAID &&
      orderAssignmentExists?.status === OrderAssignmentStatus.ACTIVE
    ) {
      await this.orderActivityService.createOrderActivity({
        orderId: orderAssignmentExists?.orderId,
        status: OrderStatus.CONFIRMED,
        createdById: orderAssignmentExists?.createdById,
      });
    }

    return updatedOrderAssignment;
  }

  // ACCEPT ORDER ASSIGNMENT
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER_ASSIGNMENT,
    getEntityId: (args) => args[0],
  })
  async acceptOrderAssignment(id: UUID): Promise<OrderAssignment> {
    const orderAssignment = await this.getOrderAssignmentById(id);
    const updatedOrderAssignment = await this.orderAssignmentRepository.save({
      ...orderAssignment,
      status: OrderAssignmentStatus.ACTIVE,
    });

    if (
      orderAssignment?.order?.activities?.shift()?.status === OrderStatus.PAID
    ) {
      await this.orderActivityService.createOrderActivity({
        orderId: orderAssignment?.orderId,
        status: OrderStatus.CONFIRMED,
        createdById: orderAssignment?.createdById,
      });
    }

    // Notify the assignment creator that the rider accepted
    if (orderAssignment.createdById && orderAssignment.createdById !== orderAssignment.assignedToId) {
      this.sendAssignmentPush({
        userId: orderAssignment.createdById,
        assignmentId: updatedOrderAssignment.id,
        orderId: updatedOrderAssignment.orderId,
        title: 'Assignment accepted',
        body: `Rider has accepted order #${orderAssignment.order?.referenceId || ''}.`,
      }).catch((error) =>
        logger.error('Failed to send assignment accepted push', error)
      );
    }

    return updatedOrderAssignment;
  }

  // REJECT ORDER ASSIGNMENT
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER_ASSIGNMENT,
    getEntityId: (args) => args[0],
  })
  async rejectOrderAssignment(id: UUID): Promise<OrderAssignment> {
    const orderAssignment = await this.getOrderAssignmentById(id);
    const updatedOrderAssignment = await this.orderAssignmentRepository.save({
      ...orderAssignment,
      status: OrderAssignmentStatus.REJECTED,
    });

    // HANDLE ORDER ASSIGNMENT
    const newOrderAssignment = await this.handleOrderAssignment({
      orderId: updatedOrderAssignment?.orderId,
    });

    return newOrderAssignment;
  }

  // RECOVER REJECTED ORDER ASSIGNMENT
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORDER_ASSIGNMENT,
    getEntityId: (args) => args[0],
  })
  async recoverOrderAssignment(
    id: UUID,
    scope?: RiderAssignmentScope
  ): Promise<OrderAssignment> {
    const orderAssignment = await this.getOrderAssignmentById(id, scope);

    if (orderAssignment.status !== OrderAssignmentStatus.REJECTED) {
      throw new ConflictError('Only rejected assignments can be recovered.');
    }

    const siblingAssignments = await this.orderAssignmentRepository.find({
      where: {
        orderId: orderAssignment.orderId,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    const openStatuses = [
      OrderAssignmentStatus.PENDING,
      OrderAssignmentStatus.ACTIVE,
    ];

    const assignmentForAnotherRider = siblingAssignments.find(
      (assignment) =>
        assignment.id !== orderAssignment.id &&
        openStatuses.includes(assignment.status) &&
        Boolean(assignment.assignedToId) &&
        assignment.assignedToId !== orderAssignment.assignedToId
    );

    if (assignmentForAnotherRider) {
      throw new ConflictError(
        'This assignment has already been assigned to another rider.'
      );
    }

    const supersededAssignments = siblingAssignments.filter(
      (assignment) =>
        assignment.id !== orderAssignment.id &&
        openStatuses.includes(assignment.status)
    );

    await Promise.all(
      supersededAssignments.map((assignment) =>
        this.orderAssignmentRepository.save({
          ...assignment,
          status: OrderAssignmentStatus.CANCELLED,
        })
      )
    );

    const recoveredAssignment = await this.orderAssignmentRepository.save({
      ...orderAssignment,
      status: OrderAssignmentStatus.PENDING,
    });

    return this.getOrderAssignmentById(recoveredAssignment.id, scope);
  }

  // HANDLE ORDER ASSIGNMENT
  async handleOrderAssignment({
    orderId,
    assignedToId,
  }: {
    orderId: UUID;
    assignedToId?: UUID;
  }): Promise<OrderAssignment> {
    // CHECK IF ORDER EXISTS
    const orderExists = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        assignments: true,
        activities: true,
      },
    });

    if (!orderExists) {
      throw new NotFoundError('Order not found');
    }

    if (orderExists?.assignments?.length >= 0) {
      // CANCEL ALL OTHER ACTIVE ASSIGNMENTS
      const activeAssignments = orderExists?.assignments?.filter(
        (assignment) => assignment.status === OrderAssignmentStatus.ACTIVE
      );

      await Promise.all(
        activeAssignments.map(async (assignment) => {
          assignment.status = OrderAssignmentStatus.CANCELLED;
          await this.orderAssignmentRepository.save(assignment);

          // Notify the cancelled rider
          if (assignment.assignedToId) {
            this.sendAssignmentPush({
              userId: assignment.assignedToId,
              assignmentId: assignment.id,
              orderId: assignment.orderId,
              title: 'Assignment cancelled',
              body: `Order #${orderExists.referenceId || ''} has been reassigned.`,
            }).catch((error) =>
              logger.error('Failed to send cancellation push', error)
            );
          }
        })
      );
    }

    // CHECK IF ASSIGNED TO ID EXISTS
    let assignedToExists = await this.userService.getUserByCondition({
      id: assignedToId,
      userRoles: {
        role: {
          name: RoleTypes.RIDER,
        },
      },
      status: UserStatus.ACTIVE,
    });

    /**
     * HANDLE RIDER ASSIGNMENT
     */
    if (!assignedToExists) {
      let availableRiders = await this.userService.fetchUsers({
        page: 0,
        size: 10,
        condition: {
          userRoles: {
            role: {
              name: RoleTypes.RIDER,
            },
          },
          status: UserStatus.ACTIVE,
        },
        relations: ['userRoles.role', 'assignments'],
      });

      // SORT BY ASSIGNMENTS
      availableRiders?.rows.sort((a, b) => {
        return a.assignments.length - b.assignments.length;
      });

      assignedToExists = availableRiders?.rows[0];
    }

    const createdOrderAssignment = await this.orderAssignmentRepository.save({
      orderId,
      assignedToId: assignedToExists?.id,
    });

    if (orderExists?.activities?.shift()?.status === OrderStatus.PAID) {
      await this.orderActivityService.createOrderActivity({
        orderId,
        status: OrderStatus.ACCEPTED,
        createdById: orderExists?.createdById,
      });
    }

    if (assignedToExists?.id) {
      const orderRef = orderExists.referenceId || '';
      this.sendAssignmentPush({
        userId: assignedToExists.id,
        assignmentId: createdOrderAssignment.id,
        orderId: createdOrderAssignment.orderId,
        title: `New Order #${orderRef}`,
        body: `You've been assigned order #${orderRef}. Tap to review.`,
      }).catch((error) =>
        logger.error('Failed to send assignment push', error)
      );
    }

    return createdOrderAssignment;
  }

  private async sendAssignmentPush({
    userId,
    assignmentId,
    orderId,
    title,
    body,
    urgent = false,
  }: {
    userId: UUID;
    assignmentId: UUID;
    orderId?: UUID;
    title: string;
    body: string;
    urgent?: boolean;
  }): Promise<void> {
    await pushService.sendPushNotification({
      userIds: [userId],
      title,
      body,
      type: PushNotificationType.ASSIGNMENT,
      channelId: urgent ? 'assignments_urgent' : 'assignments',
      data: {
        assignmentId,
        orderId,
      },
    });
  }
}
