import { FindOptionsWhere, Repository, Like, In, ILike } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { UUID } from "../types";
import { LogReferenceTypes } from "../constants/logs.constants";
import { NotFoundError, ValidationError } from "../helpers/errors.helper";
import { UserRoleService } from "./userRole.service";
import { RoleTypes } from "../constants/role.constants";
import { getPagingData } from "../helpers/pagination.helper";
import { Pagination } from "../helpers/pagination.helper";
import { getPagination } from "../helpers/pagination.helper";
import { UserStatus } from "../constants/user.constants";
import { OrderService } from "./order.service";
import { OrderAssignmentService } from "./orderAssignment.service";
import { hashPassword } from "../helpers/auth.helper";
import { EmailService } from "./email.service";

export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleService: UserRoleService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService(this);
  }

  // GET USER BY ID
  async getUserById(id: UUID): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError("User not found", {
        referenceId: id,
        referenceType: LogReferenceTypes.USER,
      });
    }

    return user;
  }

  // GET USER BY CONDITION
  async getUserByCondition(
    condition: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    includePassword: boolean = false
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: condition,
      relations: {
        userRoles: {
          role: true,
        },
        assignments: true,
      },
      select: includePassword ? {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        status: true,
        nationality: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      } : undefined,
    });
    console.log(user);
    return user;
  }

  // CREATE USER
  async createUser(
    user: Partial<User>,
    roles?: Partial<RoleTypes>[]
  ): Promise<User> {
    if (!user?.phoneNumber) {
      throw new ValidationError("Phone number is required");
    }

    // CHECK IF USER EXISTS
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: user?.phoneNumber },
    });

    if (existingUser) {
      return existingUser;
    }

    const createdUser = await this.userRepository.save(user);

    // Assign default CUSTOMER role if no roles provided
    const rolesToAssign = roles && roles.length > 0 ? roles : [RoleTypes.CUSTOMER];
    await this.userRoleService.assignRolesToUser(createdUser?.id, rolesToAssign);

    return createdUser;
  }

  // UPDATE USER
  async updateUser(id: UUID, user: Partial<User>): Promise<User> {
    const userExists = await this.getUserById(id);

    return this.userRepository.save({
      ...userExists,
      ...user,
    });
  }

  // FETCH USERS
  async fetchUsers({
    page,
    size,
    condition,
    relations = ["userRoles.role"],
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<User> | FindOptionsWhere<User>[];
    relations?: string[];
  }): Promise<Pagination<User>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const users = await this.userRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations,
    });

    return getPagingData({
      data: users,
      page,
      size,
    });
  }

  // GET USERS WITH PAGINATION AND FILTERS
  async getUsersWithPagination({
    page,
    limit,
    filters,
  }: {
    page: number;
    limit: number;
    filters: {
      search?: string;
      roles?: RoleTypes[];
      status?: UserStatus;
      phoneNumber?: string;
      name?: string;
      email?: string;
    };
  }): Promise<Pagination<User>> {
    const { take, skip } = getPagination({ page, size: limit });

    // Build query
    const query = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userRoles", "userRole")
      .leftJoinAndSelect("userRole.role", "role");

    // Apply search filter
    if (filters.search) {
      query.andWhere(
        "(user.name ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Apply specific filters
    if (filters.name) {
      query.andWhere("user.name ILIKE :name", { name: `%${filters.name}%` });
    }

    if (filters.email) {
      query.andWhere("user.email ILIKE :email", { email: `%${filters.email}%` });
    }

    if (filters.phoneNumber) {
      query.andWhere("user.phoneNumber ILIKE :phoneNumber", {
        phoneNumber: `%${filters.phoneNumber}%`,
      });
    }

    if (filters.status) {
      query.andWhere("user.status = :status", { status: filters.status });
    }

    // Apply role filter
    if (filters.roles && filters.roles.length > 0) {
      query.andWhere("role.name IN (:...roles)", { roles: filters.roles });
    }

    // Apply pagination
    query.skip(skip).take(take);

    // Execute query
    const [users, total] = await query.getManyAndCount();

    return getPagingData({
      data: [users, total],
      page,
      size: limit,
    });
  }

  // UPDATE USER STATUS
  async updateUserStatus(id: UUID, status: UserStatus): Promise<User> {
    const user = await this.getUserById(id);
    
    user.status = status;
    
    return this.userRepository.save(user);
  }

  // DELETE USER (SOFT DELETE)
  async deleteUser(id: UUID): Promise<void> {
    const user = await this.getUserById(id);
    
    // Soft delete by setting status to SUSPENDED
    user.status = UserStatus.INACTIVE;
    user.updatedAt = new Date();
    
    await this.userRepository.save(user);
  }

  // RESET USER PASSWORD
  async resetPassword(id: UUID): Promise<void> {
    const user = await this.getUserById(id);

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    // Update user password
    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);

    // Send email with temporary password
    const emailService = new EmailService();
    await emailService.sendPasswordResetEmail(user.email || user.phoneNumber, tempPassword);
  }

  // GET USER ORDERS
  async getUserOrders(
    userId: UUID,
    pagination: { page: number; limit: number }
  ): Promise<Pagination<any>> {
    const orderService = new OrderService();
    
    return orderService.fetchOrders({
      page: pagination.page,
      size: pagination.limit,
      condition: {
        createdById: userId,
      },
    });
  }

  // GET USER ASSIGNMENTS (FOR RIDERS)
  async getUserAssignments(
    userId: UUID,
    pagination: { page: number; limit: number }
  ): Promise<Pagination<any>> {
    const assignmentService = new OrderAssignmentService();
    
    return assignmentService.fetchOrderAssignments({
      page: pagination.page,
      size: pagination.limit,
      condition: {
        assignedToId: userId,
      },
    });
  }
}
