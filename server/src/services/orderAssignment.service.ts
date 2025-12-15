import { FindOptionsWhere, Repository, In, Not } from "typeorm";
import { OrderAssignment } from "../entities/orderAssignment.entity";
import { AppDataSource } from "../data-source";
import { getPagination, getPagingData } from "../helpers/pagination.helper";
import { Pagination } from "../helpers/pagination.helper";
import { OrderAssignmentStatus, OrderStatus } from "../constants/order.constants";
import { Order } from "../entities/order.entity";
import { OrderActivity } from "../entities/orderActivity.entity";
import { NotFoundError } from "../helpers/errors.helper";
import { UserService } from "./user.service";
import { RoleTypes } from "../constants/role.constants";
import { User } from "../entities/user.entity";
import { UserStatus } from "../constants/user.constants";
import { UUID } from "../types";
import { LogReferenceTypes } from "../constants/logs.constants";
import { Request } from "express";
import { RiderLocationService } from "./riderLocation.service";

export class OrderAssignmentService {
  private readonly orderAssignmentRepository: Repository<OrderAssignment>;
  private readonly orderRepository: Repository<Order>;
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly userService: UserService;
  private readonly riderLocationService: RiderLocationService;

  constructor() {
    this.orderAssignmentRepository =
      AppDataSource.getRepository(OrderAssignment);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderActivityRepository = AppDataSource.getRepository(OrderActivity);
    this.userService = new UserService();
    this.riderLocationService = new RiderLocationService();
  }

  // CREATE ORDER ASSIGNMENT
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
      throw new NotFoundError("Order not found");
    }

    if (orderExists?.assignments?.length >= 0) {
      // CANCEL ALL OTHER ACTIVE ASSIGNMENTS
      await Promise.all(
        orderExists?.assignments
          ?.filter(
            (assignment) => assignment.status === OrderAssignmentStatus.ACTIVE
          )
          .map((assignment) => {
            assignment.status = OrderAssignmentStatus.CANCELLED;
            return this.orderAssignmentRepository.save(assignment);
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
      // Get riders without active orders
      const activeAssignments = await this.orderAssignmentRepository.find({
        where: {
          status: In([OrderAssignmentStatus.PENDING, OrderAssignmentStatus.ACTIVE]),
        },
        select: ['assignedToId'],
      });

      const busyRiderIds = activeAssignments.map((a) => a.assignedToId).filter(Boolean) as UUID[];

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
          ...(busyRiderIds.length > 0 && { id: Not(In(busyRiderIds)) }),
        },
        relations: ["userRoles.role"],
      });

      if (availableRiders?.rows.length === 0) {
        throw new NotFoundError("No available riders found");
      }

      assignedToExists = availableRiders?.rows[0];
    }

    // CREATE ORDER ASSIGNMENT
    const createdOrderAssignment = await this.orderAssignmentRepository.save({
      ...orderAssignment,
      assignedToId: assignedToExists?.id,
      assignedTo: assignedToExists,
    });

    return createdOrderAssignment;
  }

  // GET AVAILABLE RIDERS
  async getAvailableRiders({
    latitude,
    longitude,
    limit = 10,
  }: {
    latitude: number;
    longitude: number;
    limit?: number;
  }): Promise<Array<
    User & {
      distance: number | null;
      location?: { latitude: number; longitude: number } | null;
      activeOrderCount: number;
      isBusy: boolean;
      isOnline: boolean;
    }
  >> {
    const { calculateDistance } = await import("../helpers/distance.helper");

    // Pull online locations and index by rider for quick lookup
    const riderLocations = await this.riderLocationService.getOnlineRiderLocations();
    const riderLocationMap = new Map(
      riderLocations.map((loc) => [loc.riderId, loc])
    );

    // Count active/pending assignments per rider to balance load
    const activeAssignments = await this.orderAssignmentRepository
      .createQueryBuilder("assignment")
      .select("assignment.assignedToId", "assignedToId")
      .addSelect("COUNT(*)", "count")
      .where("assignment.status IN (:...statuses)", {
        statuses: [OrderAssignmentStatus.PENDING, OrderAssignmentStatus.ACTIVE],
      })
      .groupBy("assignment.assignedToId")
      .getRawMany();

    const activeCountByRider = new Map<UUID, number>();
    activeAssignments.forEach((row: { assignedToId: UUID; count: string }) => {
      if (row.assignedToId) {
        activeCountByRider.set(row.assignedToId, Number(row.count) || 0);
      }
    });

    // Fetch all active riders
    const ridersResult = await this.userService.fetchUsers({
      page: 1,
      size: 1000,
      condition: {
        userRoles: {
          role: {
            name: RoleTypes.RIDER,
          },
        },
        status: UserStatus.ACTIVE,
      },
      relations: ["userRoles.role"],
    });

    const ridersWithMeta = ridersResult.rows.map((rider) => {
      const location = riderLocationMap.get(rider.id as UUID);
      const distance = location
        ? calculateDistance(
            latitude,
            longitude,
            Number(location.latitude),
            Number(location.longitude)
          )
        : null;
      const activeOrderCount = activeCountByRider.get(rider.id as UUID) || 0;

      return {
        ...rider,
        distance,
        location: location
          ? {
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
            }
          : null,
        activeOrderCount,
        isBusy: activeOrderCount > 0,
        isOnline: Boolean(location?.isOnline),
      };
    });

    // Sort by fewest active orders, then nearest distance; riders without location go last
    ridersWithMeta.sort((a, b) => {
      if (a.activeOrderCount !== b.activeOrderCount) {
        return a.activeOrderCount - b.activeOrderCount;
      }

      const distanceA = a.distance ?? Number.POSITIVE_INFINITY;
      const distanceB = b.distance ?? Number.POSITIVE_INFINITY;
      return distanceA - distanceB;
    });

    return ridersWithMeta.slice(0, limit);
  }

  // FETCH ORDER ASSIGNMENTS
  async fetchOrderAssignments(query: Request['query']): Promise<Pagination> {
    const { page = 0, size = 10, orderId, assignedToId, status } = query;

    let condition: FindOptionsWhere<OrderAssignment> | FindOptionsWhere<OrderAssignment>[] = {};

    if (orderId) {
      condition.orderId = orderId as UUID;
    }
    
    if (assignedToId) {
      condition.assignedToId = assignedToId as UUID;
    }

    if (status) {
      condition.status = status as OrderAssignmentStatus;
    }

    const { take, skip, currentPage } = getPagination({ page: Number(page), size: Number(size) });

    // Primary: fetch from order_assignments
    const [assignmentRows, assignmentCount] = await this.orderAssignmentRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        order: {
          sender: true,
          recipient: true,
          createdBy: true,
        },
        assignedTo: true,
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const enrichWithPhones = (items: OrderAssignment[]) =>
      items.map((assignment) => {
        if (assignment.order) {
          const { order } = assignment;
          const senderPhoneNumber = (order as any)?.sender?.phoneNumber || (order as any)?.createdBy?.phoneNumber || null;
          const recipientPhoneNumber = (order as any)?.recipient?.phoneNumber || null;
          (assignment as any).order = {
            ...order,
            senderPhoneNumber,
            recipientPhoneNumber,
          };
        }
        return assignment;
      });

    // Only fetch from order_assignments table - this is the single source of truth for rider assignments
    const enrichedRows = enrichWithPhones(assignmentRows);

    const paginatedData = getPagingData({
      data: [assignmentRows, assignmentCount],
      page: Number(page),
      size: Number(size),
    });

    return {
      rows: enrichedRows,
      totalCount: paginatedData.totalCount,
      totalPages: paginatedData.totalPages,
      currentPage: paginatedData.currentPage,
    };
  }

  // GET ORDER ASSIGNMENT BY ID
  async getOrderAssignmentById(id: UUID): Promise<OrderAssignment> {
    // Fetch from order_assignments table - this is the single source of truth
    const orderAssignment = await this.orderAssignmentRepository.findOne({
      where: { id },
      relations: {
        order: true,
        assignedTo: true,
        createdBy: true,
      }
    });

    if (orderAssignment) {
      return orderAssignment;
    }

    throw new NotFoundError("Order assignment not found", {
      referenceId: id,
      referenceType: LogReferenceTypes.ORDER_ASSIGNMENT,
    });
  }

  // UPDATE ORDER ASSIGNMENT
  async updateOrderAssignment(
    id: UUID,
    orderAssignment: Partial<OrderAssignment>
  ): Promise<OrderAssignment> {
    // CHECK IF ORDER ASSIGNMENT EXISTS
    const orderAssignmentExists = await this.getOrderAssignmentById(id);

    return this.orderAssignmentRepository.save({
      ...orderAssignmentExists,
      ...orderAssignment,
    });
  }

  // ACCEPT ORDER ASSIGNMENT
  async acceptOrderAssignment(id: UUID): Promise<OrderAssignment> {
    const orderAssignment = await this.getOrderAssignmentById(id);
    
    // If this is a real assignment row in order_assignments table, update it
    const realAssignment = await this.orderAssignmentRepository.findOne({
      where: { id }
    });

    if (realAssignment) {
      const updatedAssignment = await this.orderAssignmentRepository.save({
        ...orderAssignment,
        status: OrderAssignmentStatus.ACTIVE,
      });

      // CREATE ORDER ACTIVITY TO LOG STATUS CHANGE TO IN_TRANSIT
      if (updatedAssignment.orderId) {
        await this.orderActivityRepository.save({
          orderId: updatedAssignment.orderId,
          status: OrderStatus.IN_TRANSIT,
          createdById: updatedAssignment.assignedToId,
        });
      }

      return updatedAssignment;
    }

    // Fallback: This is an order with rider_id (no real assignment row)
    // Create an assignment row
    const newAssignment = await this.orderAssignmentRepository.save({
      orderId: orderAssignment.orderId,
      assignedToId: orderAssignment.assignedToId,
      status: OrderAssignmentStatus.ACTIVE,
    });

    // CREATE ORDER ACTIVITY TO LOG STATUS CHANGE TO IN_TRANSIT
    if (newAssignment.orderId) {
      await this.orderActivityRepository.save({
        orderId: newAssignment.orderId,
        status: OrderStatus.IN_TRANSIT,
        createdById: newAssignment.assignedToId,
      });
    }

    return newAssignment;
  }

  // REJECT ORDER ASSIGNMENT
  async rejectOrderAssignment(id: UUID): Promise<OrderAssignment> {
    const orderAssignment = await this.getOrderAssignmentById(id);
    
    // If this is a real assignment row in order_assignments table, update it
    const realAssignment = await this.orderAssignmentRepository.findOne({
      where: { id }
    });

    if (realAssignment) {
      const updatedOrderAssignment = await this.orderAssignmentRepository.save({
        ...orderAssignment,
        status: OrderAssignmentStatus.REJECTED,
      });

      // HANDLE ORDER ASSIGNMENT (reassign to another rider)
      const newOrderAssignment = await this.handleOrderAssignment({
        orderId: updatedOrderAssignment?.orderId,
      });

      return newOrderAssignment;
    }

    // Fallback: This is an order with rider_id (no real assignment row)
    // Create an assignment row with REJECTED status
    const rejectedAssignment = await this.orderAssignmentRepository.save({
      orderId: orderAssignment.orderId,
      assignedToId: orderAssignment.assignedToId,
      status: OrderAssignmentStatus.REJECTED,
    });

    // HANDLE ORDER ASSIGNMENT (reassign to another rider)
    const newOrderAssignment = await this.handleOrderAssignment({
      orderId: rejectedAssignment?.orderId,
    });

    return newOrderAssignment;
  }

  // COMPLETE ORDER ASSIGNMENT
  async completeOrderAssignment(id: UUID): Promise<OrderAssignment> {
    const orderAssignment = await this.getOrderAssignmentById(id);
    
    // If this is a real assignment row in order_assignments table, update it
    const realAssignment = await this.orderAssignmentRepository.findOne({
      where: { id }
    });

    if (realAssignment) {
      const updatedAssignment = await this.orderAssignmentRepository.save({
        ...orderAssignment,
        status: OrderAssignmentStatus.COMPLETED,
      });

      // CREATE ORDER ACTIVITY TO LOG STATUS CHANGE TO DELIVERED
      if (updatedAssignment.orderId) {
        await this.orderActivityRepository.save({
          orderId: updatedAssignment.orderId,
          status: OrderStatus.DELIVERED,
          createdById: updatedAssignment.assignedToId,
        });
      }

      return updatedAssignment;
    }

    // Fallback: This is an order with rider_id (no real assignment row)
    // Create an assignment row
    const newAssignment = await this.orderAssignmentRepository.save({
      orderId: orderAssignment.orderId,
      assignedToId: orderAssignment.assignedToId,
      status: OrderAssignmentStatus.COMPLETED,
    });

    // CREATE ORDER ACTIVITY TO LOG STATUS CHANGE TO DELIVERED
    if (newAssignment.orderId) {
      await this.orderActivityRepository.save({
        orderId: newAssignment.orderId,
        status: OrderStatus.DELIVERED,
        createdById: newAssignment.assignedToId,
      });
    }

    return newAssignment;
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
      },
    });

    if (!orderExists) {
      throw new NotFoundError("Order not found");
    }

    if (orderExists?.assignments?.length >= 0) {
      // CANCEL ALL OTHER ACTIVE ASSIGNMENTS
      await Promise.all(
        orderExists?.assignments
          ?.filter(
            (assignment) => assignment.status === OrderAssignmentStatus.ACTIVE
          )
          .map((assignment) => {
            assignment.status = OrderAssignmentStatus.CANCELLED;
            return this.orderAssignmentRepository.save(assignment);
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
        // Get riders without active orders
        const activeAssignments = await this.orderAssignmentRepository.find({
          where: {
            status: In([OrderAssignmentStatus.PENDING, OrderAssignmentStatus.ACTIVE]),
          },
          select: ['assignedToId'],
        });

        const busyRiderIds = activeAssignments.map((a) => a.assignedToId).filter(Boolean) as UUID[];

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
            ...(busyRiderIds.length > 0 && { id: Not(In(busyRiderIds)) }),
          },
          relations: ["userRoles.role"],
        });
  
        if (availableRiders?.rows.length === 0) {
          throw new NotFoundError("No available riders found");
        }
  
      assignedToExists = availableRiders?.rows[0];
    }

    const createdOrderAssignment = await this.orderAssignmentRepository.save({
      orderId,
      assignedToId: assignedToExists?.id,
    });

    return createdOrderAssignment;
  }
}
