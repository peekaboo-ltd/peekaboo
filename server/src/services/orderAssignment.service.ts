import { FindOptionsWhere, Repository } from "typeorm";
import { OrderAssignment } from "../entities/orderAssignment.entity";
import { AppDataSource } from "../data-source";
import { getPagination, getPagingData } from "../helpers/pagination.helper";
import { Pagination } from "../helpers/pagination.helper";
import { OrderAssignmentStatus } from "../constants/order.constants";
import { Order } from "../entities/order.entity";
import { NotFoundError } from "../helpers/errors.helper";
import { UserService } from "./user.service";
import { RoleTypes } from "../constants/role.constants";
import { User } from "../entities/user.entity";
import { UserStatus } from "../constants/user.constants";
import { UUID } from "../types";
import { LogReferenceTypes } from "../constants/logs.constants";
import { Request } from "express";

export class OrderAssignmentService {
  private readonly orderAssignmentRepository: Repository<OrderAssignment>;
  private readonly orderRepository: Repository<Order>;
  private readonly userService: UserService;

  constructor() {
    this.orderAssignmentRepository =
      AppDataSource.getRepository(OrderAssignment);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.userService = new UserService();
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
        relations: ["userRoles.role", "assignments"],
      });

      if (availableRiders?.rows.length === 0) {
        throw new NotFoundError("No available riders found");
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

    return createdOrderAssignment;
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

    const { take, skip } = getPagination({ page: Number(page), size: Number(size) });

    const orderAssignments = await this.orderAssignmentRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        order: true,
        assignedTo: true,
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({ data: orderAssignments, page: Number(page), size: Number(size) });
  }

  // GET ORDER ASSIGNMENT BY ID
  async getOrderAssignmentById(id: UUID): Promise<OrderAssignment> {
    const orderAssignment = await this.orderAssignmentRepository.findOne({
      where: { id },
      relations: {
        order: true,
        assignedTo: true,
        createdBy: true,
      }
    });

    if (!orderAssignment) {
      throw new NotFoundError("Order assignment not found", {
        referenceId: id,
        referenceType: LogReferenceTypes.ORDER_ASSIGNMENT,
      });
    }

    return orderAssignment;
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
    return this.orderAssignmentRepository.save({
      ...orderAssignment,
      status: OrderAssignmentStatus.ACTIVE,
    });
  }

  // REJECT ORDER ASSIGNMENT
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
          relations: ["userRoles.role", "assignments"],
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

    return createdOrderAssignment;
  }
}
