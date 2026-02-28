import { FindOptionsWhere, Repository, Like, In, ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { UUID } from '../types';
import { LogReferenceTypes } from '../constants/logs.constants';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { UserRoleService } from './userRole.service';
import { RoleTypes } from '../constants/role.constants';
import { getPagingData } from '../helpers/pagination.helper';
import { Pagination } from '../helpers/pagination.helper';
import { getPagination } from '../helpers/pagination.helper';
import { UserStatus } from '../constants/user.constants';
import { hashPassword } from '../helpers/auth.helper';
import { EmailService } from '../integrations/emails/email.service';
import { Request } from 'express';
import { OrganizationMembershipService } from './organizationMembership.service';
import { MembershipStatus, OrganizationRole } from '../constants/organization.constants';
import { AuditCreate, AuditUpdate, AuditDelete } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';


interface UserTrackingListItem {
  id: UUID;
  name?: string;
  status: UserStatus;
  currentLocation: User['currentLocation'] | null;
  updatedAt: Date;
  roles: Array<{
    id: UUID;
    name: RoleTypes;
    label: string | null;
  }>;
}


export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleService: UserRoleService;
  private readonly organizationMembershipService: OrganizationMembershipService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService();
    this.organizationMembershipService = new OrganizationMembershipService();
  }

  // GET USER BY ID
  async getUserById(id: UUID): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        userRoles: { role: true },
        organizationMembership: {
          organization: true,
          addedBy: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found', {
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
      select: includePassword
        ? {
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
          }
        : undefined,
    });
    return user;
  }

  // Alias for audit decorators
  async getEntityById(id: UUID): Promise<User> {
    return this.getUserById(id);
  }

  // CREATE USER
  @AuditCreate({
    entityType: AuditLogEntityTypes.USER,
  })
  async createUser(
    user: Partial<User>,
    roles?: Partial<RoleTypes>[],
    options?: {
      organizationId?: UUID;
      addedById?: UUID;
    }
  ): Promise<User> {
    if (!user?.phoneNumber) {
      throw new ValidationError('Phone number is required');
    }

    // CHECK IF USER EXISTS
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: user?.phoneNumber },
    });

    if (existingUser) {
      return existingUser;
    }

    // NEW PASSWORD
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    // CREATE USER
    const createdUser = await this.userRepository.save({
      ...user,
      passwordHash: hashedPassword,
    });

    // Assign default CUSTOMER role if no roles provided
    const rolesToAssign =
      roles && roles.length > 0 ? roles : [RoleTypes.CUSTOMER];
    await this.userRoleService.assignRolesToUser(
      createdUser?.id,
      rolesToAssign
    );

    if (options?.organizationId) {
      await this.organizationMembershipService.createMembershipForUser({
        userId: createdUser.id,
        organizationId: options.organizationId,
        role: OrganizationRole.MEMBER,
        status: MembershipStatus.ACTIVE,
        addedById: options.addedById,
      });
    }

    // SEND ADMIN-CREATED ACCOUNT EMAIL WITH TEMP PASSWORD AND ROLES
    if (createdUser.email) {
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const emailService = new EmailService();
      await emailService.sendAdminCreatedAccountEmail({
        name: createdUser.name || '',
        email: createdUser.email,
        temporaryPassword: tempPassword,
        roles: rolesToAssign.map((r) => String(r)),
        loginUrl: `${baseUrl}/auth/login`,
      });
    }

    return this.getUserById(createdUser.id);
  }

  // UPDATE USER
  @AuditUpdate({
    entityType: AuditLogEntityTypes.USER,
    getEntityId: (args) => args[0],
  })
  async updateUser(id: UUID, user: Partial<User>): Promise<User> {
    const userExists = await this.getUserById(id);

    return this.userRepository.save({
      ...userExists,
      ...user,
    });
  }

  // Intentionally not audited: high-frequency GPS updates would create
  // excessive log volume with minimal audit value.
  async updateCurrentLocation(
    id: UUID,
    location: { latitude: number; longitude: number }
  ): Promise<User> {
    const user = await this.getUserById(id);

    user.currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      collectedAt: new Date().toISOString(),
    };

    return this.userRepository.save(user);
  }

  // FETCH USERS
  async fetchUsers({
    page,
    size,
    condition,
    relations = ['userRoles.role'],
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
  async getUsersWithPagination(
    query: Request['query']
  ): Promise<Pagination<User>> {
    const {
      page = 0,
      size = 10,
      search,
      roles,
      status,
      phoneNumber,
      name,
      email,
      organizationId,
    } = query;

    // Check if we need query builder for complex filters (search or roles)
    const needsQueryBuilder =
      search || (roles && Array.isArray(roles) ? roles.length > 0 : roles) || organizationId;

    if (needsQueryBuilder) {
      // Use query builder for complex filters
      const { take, skip } = getPagination({
        page: Number(page),
        size: Number(size),
      });

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRoles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('user.organizationMembership', 'membership')
        .leftJoinAndSelect('membership.organization', 'organization');

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          '(user.name ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply specific filters
      if (name) {
        queryBuilder.andWhere('user.name ILIKE :name', { name: `%${name}%` });
      }

      if (email) {
        queryBuilder.andWhere('user.email ILIKE :email', {
          email: `%${email}%`,
        });
      }

      if (phoneNumber) {
        queryBuilder.andWhere('user.phoneNumber ILIKE :phoneNumber', {
          phoneNumber: `%${phoneNumber}%`,
        });
      }

      if (status) {
        queryBuilder.andWhere('user.status = :status', { status });
      }

      // Apply role filter
      if (roles) {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        queryBuilder.andWhere('role.name IN (:...roles)', { roles: roleArray });
      }

      // Apply organization filter
      if (organizationId) {
        queryBuilder.andWhere('membership.organizationId = :organizationId', {
          organizationId,
        });
      }

      // Apply pagination and ordering
      queryBuilder.skip(skip).take(take).orderBy('user.createdAt', 'DESC');

      // Execute query
      const [users, total] = await queryBuilder.getManyAndCount();

      return getPagingData({
        data: [users, total],
        page: Number(page),
        size: Number(size),
      });
    } else {
      // Use findAndCount for simple filters (matching fetchOrders pattern)
      let condition: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

      if (status) {
        condition.status = status as UserStatus;
      }

      if (phoneNumber) {
        condition.phoneNumber = ILike(`%${phoneNumber}%`);
      }

      if (name) {
        condition.name = ILike(`%${name}%`);
      }

      if (email) {
        condition.email = ILike(`%${email}%`);
      }

      const { take, skip } = getPagination({
        page: Number(page),
        size: Number(size),
      });

      // GET PAGINATION
      const users = await this.userRepository.findAndCount({
        where: condition,
        skip,
        take,
        relations: {
          userRoles: {
            role: true,
          },
          organizationMembership: {
            organization: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return getPagingData({
        data: users,
        page: Number(page),
        size: Number(size),
      });
    }
  }


  // GET USERS TRACKING WITH LIGHTWEIGHT PAYLOAD
  async getUsersTracking(query: Request['query']): Promise<Pagination<UserTrackingListItem>> {
    const { page = 0, size = 10, status, role, hasCurrentLocation } = query;

    const pageNumber = Number(page) >= 0 ? Number(page) : 0;
    const sizeNumber = Number(size) > 0 ? Number(size) : 10;
    const roleFilter = Array.isArray(role) ? role[0] : role;
    const statusFilter = Array.isArray(status) ? status[0] : status;

    const hasCurrentLocationFilter =
      typeof hasCurrentLocation === 'string'
        ? hasCurrentLocation.toLowerCase() === 'true'
          ? true
          : hasCurrentLocation.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const applyFilters = (queryBuilder: any) => {
      if (statusFilter) {
        queryBuilder.andWhere('user.status = :status', { status: statusFilter });
      }

      if (roleFilter) {
        queryBuilder.andWhere('role.name = :role', { role: roleFilter });
      }

      if (hasCurrentLocationFilter === true) {
        queryBuilder.andWhere('user.currentLocation IS NOT NULL');
      }

      if (hasCurrentLocationFilter === false) {
        queryBuilder.andWhere('user.currentLocation IS NULL');
      }

      return queryBuilder;
    };

    const countQueryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.userRoles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .select('COUNT(DISTINCT user.id)', 'totalCount');

    applyFilters(countQueryBuilder);

    const totalCountResult = await countQueryBuilder.getRawOne<{ totalCount: string }>();
    const totalCount = Number(totalCountResult?.totalCount || 0);

    const { take, skip } = getPagination({
      page: pageNumber,
      size: sizeNumber,
    });

    const dataQueryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.userRoles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.status', 'status')
      .addSelect('user.currentLocation', 'currentLocation')
      .addSelect('user.updatedAt', 'updatedAt')
      .addSelect(
        `COALESCE(
          JSONB_AGG(
            DISTINCT JSONB_BUILD_OBJECT('id', role.id, 'name', role.name, 'label', role.label)
          ) FILTER (WHERE role.id IS NOT NULL),
          '[]'::jsonb
        )`,
        'roles'
      )
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.status')
      .addGroupBy('user.currentLocation')
      .addGroupBy('user.updatedAt')
      .orderBy('user.updatedAt', 'DESC')
      .skip(skip)
      .take(take);

    applyFilters(dataQueryBuilder);

    const trackingRows = await dataQueryBuilder.getRawMany<{
      id: UUID;
      name: string | null;
      status: UserStatus;
      currentLocation: User['currentLocation'] | null;
      updatedAt: Date;
      roles: Array<{ id: UUID; name: RoleTypes; label: string | null }> | string;
    }>();

    const rows: UserTrackingListItem[] = trackingRows.map((row) => ({
      id: row.id,
      name: row.name || undefined,
      status: row.status,
      currentLocation: row.currentLocation,
      updatedAt: new Date(row.updatedAt),
      roles: Array.isArray(row.roles) ? row.roles : JSON.parse(row.roles || '[]'),
    }));

    return {
      rows,
      totalCount,
      totalPages: Math.ceil(totalCount / sizeNumber),
      currentPage: pageNumber + 1,
      size: sizeNumber,
      page: pageNumber,
    };
  }

  // UPDATE USER STATUS
  @AuditUpdate({
    entityType: AuditLogEntityTypes.USER,
    getEntityId: (args) => args[0],
  })
  async updateUserStatus(id: UUID, status: UserStatus): Promise<User> {
    const user = await this.getUserById(id);

    user.status = status;

    const updatedUser = await this.userRepository.save(user);

    // Send account status email (non-blocking)
    if (user.email) {
      const emailService = new EmailService();
      const emailStatus =
        status === UserStatus.ACTIVE
          ? ('reactivated' as const)
          : ('suspended' as const);
      emailService
        .sendAccountStatusEmail({
          name: user.name || '',
          email: user.email,
          status: emailStatus,
        })
        .catch(() => {});
    }

    return updatedUser;
  }

  // DELETE USER (SOFT DELETE)
  @AuditDelete({
    entityType: AuditLogEntityTypes.USER,
    getEntityId: (args) => args[0],
  })
  async deleteUser(id: UUID): Promise<void> {
    const user = await this.getUserById(id);

    // Soft delete by setting status to SUSPENDED
    user.status = UserStatus.INACTIVE;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    // Send account deleted email (non-blocking)
    if (user.email) {
      const emailService = new EmailService();
      emailService
        .sendAccountStatusEmail({
          name: user.name || '',
          email: user.email,
          status: 'deleted',
        })
        .catch(() => {});
    }
  }

  // RESET USER PASSWORD
  @AuditUpdate({
    entityType: AuditLogEntityTypes.USER,
    getEntityId: (args) => args[0],
  })
  async resetPassword(id: UUID): Promise<void> {
    const user = await this.getUserById(id);

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    // Update user password
    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);

    // Send email with temporary password
    const contactMethod = user.email || user.phoneNumber;
    if (!contactMethod) {
      throw new Error('User has no email or phone number for password reset');
    }
    const emailService = new EmailService();
    await emailService.sendPasswordResetEmail(contactMethod, tempPassword);
  }
}
