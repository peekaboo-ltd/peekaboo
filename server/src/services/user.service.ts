import { FindOptionsWhere, Repository, Like, In, ILike, IsNull, Not } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User, UserStatusProofRecord } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
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
import { OrderAssignment } from '../entities/orderAssignment.entity';
import { OrderAssignmentStatus } from '../constants/order.constants';


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

interface RiderManagementListItem {
  rank: number;
  riderId: UUID;
  riderName?: string;
  riderEmail?: string;
  riderPhoneNumber?: string;
  riderStatus: UserStatus;
  totalDeliveriesCompleted: number;
  totalEarnings: number;
  canceledDeliveries: number;
  failedDeliveries: number;
  activeDays: number;
  activeHours: number;
  dailyAttendance: {
    date: string;
    isPresent: boolean;
    checkInAt?: string;
    checkOutAt?: string;
    checkInImageUrl?: string;
    checkOutImageUrl?: string;
    problemReports?: Array<{
      imageUrl: string;
      mediaType?: 'photo' | 'video';
      description?: string;
      timestamp: string;
      locationLabel?: string;
    }>;
  };
}

type RiderManagementSortBy =
  | 'deliveries'
  | 'earnings'
  | 'canceled'
  | 'failed'
  | 'activeDays'
  | 'activeHours';


export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly orderAssignmentRepository: Repository<OrderAssignment>;
  private readonly userRoleService: UserRoleService;
  private readonly organizationMembershipService: OrganizationMembershipService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.orderAssignmentRepository = AppDataSource.getRepository(OrderAssignment);
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
    const { page = 0, size = 10, status, roles, hasCurrentLocation } = query;

    const pageNumber = Number(page) >= 0 ? Number(page) : 0;
    const sizeNumber = Number(size) > 0 ? Number(size) : 10;
    const roleArray = Array.isArray(roles) ? roles : roles ? [roles] : [];
    const statusFilter = Array.isArray(status) ? status[0] : status;

    const hasCurrentLocationFilter =
      typeof hasCurrentLocation === 'string'
        ? hasCurrentLocation.toLowerCase() === 'true'
          ? true
          : hasCurrentLocation.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const condition: FindOptionsWhere<User> = {};

    if (statusFilter) {
      condition.status = statusFilter as UserStatus;
    }

    if (hasCurrentLocationFilter === true) {
      condition.currentLocation = Not(IsNull());
    }
    if (hasCurrentLocationFilter === false) {
      condition.currentLocation = IsNull();
    }

    if (roleArray.length > 0) {
      const userRoleRepository = AppDataSource.getRepository(UserRole);
      const userRoles = await userRoleRepository.find({
        where: { role: { name: In(roleArray) } },
        relations: { role: true },
        select: { userId: true },
      });
      const userIds = [...new Set(userRoles.map((ur) => ur.userId))];
      if (userIds.length === 0) {
        return {
          rows: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          size: sizeNumber,
          page: pageNumber,
        };
      }
      condition.id = In(userIds);
    }

    const { take, skip } = getPagination({
      page: pageNumber,
      size: sizeNumber,
    });

    const [users, totalCount] = await this.userRepository.findAndCount({
      where: condition,
      skip,
      take,
      select: {
        id: true,
        name: true,
        status: true,
        currentLocation: true,
        updatedAt: true,
      },
      relations: {
        userRoles: { role: true },
      },
      order: { updatedAt: 'DESC' },
    });

    const rows: UserTrackingListItem[] = users.map((user) => ({
      id: user.id,
      name: user.name ?? undefined,
      status: user.status,
      currentLocation: user.currentLocation ?? null,
      updatedAt: user.updatedAt,
      roles: (user.userRoles ?? []).map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        label: ur.role.label ?? null,
      })),
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

  // GET RIDER MANAGEMENT PERFORMANCE (ADMIN)
  async getRiderManagementPerformance(
    query: Request['query']
  ): Promise<Pagination<RiderManagementListItem>> {
    const {
      page = 0,
      size = 10,
      search,
      status,
      timeframe = 'monthly',
      startDate,
      endDate,
      attendanceDate,
      name,
      sortBy = 'deliveries',
      sortOrder = 'desc',
    } = query;

    const pageNumber = Number(page) >= 0 ? Number(page) : 0;
    const sizeNumber = Number(size) > 0 ? Number(size) : 10;
    const sortDirection = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    const normalizedSortBy = String(sortBy) as RiderManagementSortBy;
    const allowedSortBy: RiderManagementSortBy[] = [
      'deliveries',
      'earnings',
      'canceled',
      'failed',
      'activeDays',
      'activeHours',
    ];
    const safeSortBy = allowedSortBy.includes(normalizedSortBy)
      ? normalizedSortBy
      : 'deliveries';

    const normalizeTextQuery = (value: Request['query'][string]): string | undefined => {
      if (typeof value !== 'string') return undefined;
      const trimmedValue = value.trim();
      return trimmedValue.length ? trimmedValue : undefined;
    };

    const searchValue = normalizeTextQuery(search);
    const statusValue = normalizeTextQuery(status);
    const timeframeValue = normalizeTextQuery(timeframe)?.toLowerCase() ?? 'monthly';
    const startDateValue = normalizeTextQuery(startDate);
    const endDateValue = normalizeTextQuery(endDate);
    const attendanceDateValue = normalizeTextQuery(attendanceDate);
    const nameValue = normalizeTextQuery(name);

    const formatLocalYmd = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const resolveAttendanceDate = (value?: string): Date => {
      if (!value) return new Date();

      const [yearString, monthString, dayString] = value.split('-');
      const year = Number(yearString);
      const month = Number(monthString);
      const day = Number(dayString);

      if (
        Number.isInteger(year) &&
        Number.isInteger(month) &&
        Number.isInteger(day) &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      ) {
        return new Date(year, month - 1, day);
      }

      const parsedDate = new Date(value);
      return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    };

    const attendanceBaseDate = resolveAttendanceDate(attendanceDateValue);
    const attendanceStart = new Date(attendanceBaseDate);
    attendanceStart.setHours(0, 0, 0, 0);
    const attendanceEnd = new Date(attendanceBaseDate);
    attendanceEnd.setHours(23, 59, 59, 999);

    const extractDailyAttendance = (
      proofs: UserStatusProofRecord[] | undefined
    ): RiderManagementListItem['dailyAttendance'] => {
      const attendanceItems = Array.isArray(proofs) ? proofs : [];
      const filtered = attendanceItems
        .map((record) => ({
          ...record,
          parsedTimestamp: new Date(record.timestamp),
        }))
        .filter(
          (record) =>
            !Number.isNaN(record.parsedTimestamp.getTime()) &&
            record.parsedTimestamp >= attendanceStart &&
            record.parsedTimestamp <= attendanceEnd
        )
        .sort(
          (firstRecord, secondRecord) =>
            firstRecord.parsedTimestamp.getTime() - secondRecord.parsedTimestamp.getTime()
        );

      const attendanceProofs = filtered.filter(
        (record) => record.category !== 'PROBLEM_REPORT'
      );
      const problemReports = filtered
        .filter((record) => record.category === 'PROBLEM_REPORT')
        .map((record) => ({
          imageUrl: record.imageUrl,
          mediaType: record.mediaType,
          description: record.description,
          timestamp: record.timestamp,
          locationLabel: record.locationLabel,
        }));

      const firstCheckIn = attendanceProofs.find((record) => record.status === UserStatus.ACTIVE);
      const latestCheckOut = [...attendanceProofs]
        .reverse()
        .find((record) => record.status === UserStatus.INACTIVE);

      return {
        date: attendanceDateValue || formatLocalYmd(attendanceStart),
        isPresent: Boolean(firstCheckIn),
        checkInAt: firstCheckIn?.timestamp,
        checkOutAt: latestCheckOut?.timestamp,
        checkInImageUrl: firstCheckIn?.imageUrl,
        checkOutImageUrl: latestCheckOut?.imageUrl,
        problemReports,
      };
    };

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    const now = new Date();

    if (timeframeValue === 'daily') {
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
    }

    if (timeframeValue === 'weekly') {
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 7);
    }

    if (timeframeValue === 'monthly') {
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 30);
    }

    if (startDateValue) {
      const parsedStartDate = new Date(startDateValue);
      if (!Number.isNaN(parsedStartDate.getTime())) {
        fromDate = parsedStartDate;
      }
    }

    if (endDateValue) {
      const parsedEndDate = new Date(endDateValue);
      if (!Number.isNaN(parsedEndDate.getTime())) {
        parsedEndDate.setHours(23, 59, 59, 999);
        toDate = parsedEndDate;
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      const swappedDate = fromDate;
      fromDate = toDate;
      toDate = swappedDate;
    }

    const ridersQueryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('role.name = :riderRole', { riderRole: RoleTypes.RIDER });

    if (searchValue) {
      ridersQueryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
        { search: `%${searchValue}%` }
      );
    }

    if (nameValue) {
      ridersQueryBuilder.andWhere('user.name ILIKE :name', {
        name: `%${nameValue}%`,
      });
    }

    const allowedStatuses = Object.values(UserStatus);
    if (statusValue && allowedStatuses.includes(statusValue as UserStatus)) {
      ridersQueryBuilder.andWhere('user.status = :status', {
        status: statusValue as UserStatus,
      });
    }

    const riders = await ridersQueryBuilder.getMany();
    const riderIds = riders.map((rider) => rider.id);

    const emptyResponse: Pagination<RiderManagementListItem> = {
      rows: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: pageNumber + 1,
      size: sizeNumber,
      page: pageNumber,
    };

    if (riderIds.length === 0) {
      return emptyResponse;
    }

    const assignmentStatsQueryBuilder = this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.order', 'order')
      .select('assignment.assignedToId', 'riderId')
      .addSelect(
        `SUM(CASE WHEN assignment.status = :completedStatus THEN 1 ELSE 0 END)`,
        'totalDeliveriesCompleted'
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN assignment.status = :completedStatus THEN COALESCE(order.finalFee, order.initialFee, 0) ELSE 0 END), 0)`,
        'totalEarnings'
      )
      .addSelect(
        `SUM(CASE WHEN assignment.status = :cancelledStatus THEN 1 ELSE 0 END)`,
        'canceledDeliveries'
      )
      .addSelect(
        `SUM(CASE WHEN assignment.status = :failedStatus THEN 1 ELSE 0 END)`,
        'failedDeliveries'
      )
      .addSelect(`COUNT(DISTINCT DATE_TRUNC('day', assignment.updatedAt))`, 'activeDays')
      .addSelect(`COUNT(DISTINCT DATE_TRUNC('hour', assignment.updatedAt))`, 'activeHours')
      .where('assignment.assignedToId IN (:...riderIds)', { riderIds })
      .setParameters({
        completedStatus: OrderAssignmentStatus.COMPLETED,
        cancelledStatus: OrderAssignmentStatus.CANCELLED,
        failedStatus: OrderAssignmentStatus.REJECTED,
      });

    if (fromDate) {
      assignmentStatsQueryBuilder.andWhere('assignment.updatedAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      assignmentStatsQueryBuilder.andWhere('assignment.updatedAt <= :toDate', { toDate });
    }

    const assignmentStats = await assignmentStatsQueryBuilder
      .groupBy('assignment.assignedToId')
      .getRawMany<{
        riderId: UUID;
        totalDeliveriesCompleted: string;
        totalEarnings: string;
        canceledDeliveries: string;
        failedDeliveries: string;
        activeDays: string;
        activeHours: string;
      }>();

    const statsMap = new Map(
      assignmentStats.map((stats) => [stats.riderId, stats])
    );

    const mergedRows: RiderManagementListItem[] = riders.map((rider) => {
      const stats = statsMap.get(rider.id);
      return {
        rank: 0,
        riderId: rider.id,
        riderName: rider.name,
        riderEmail: rider.email,
        riderPhoneNumber: rider.phoneNumber,
        riderStatus: rider.status,
        totalDeliveriesCompleted: Number(stats?.totalDeliveriesCompleted ?? 0),
        totalEarnings: Number(stats?.totalEarnings ?? 0),
        canceledDeliveries: Number(stats?.canceledDeliveries ?? 0),
        failedDeliveries: Number(stats?.failedDeliveries ?? 0),
        activeDays: Number(stats?.activeDays ?? 0),
        activeHours: Number(stats?.activeHours ?? 0),
        dailyAttendance: extractDailyAttendance(rider.statusProofs),
      };
    });

    const metricValue = (row: RiderManagementListItem): number => {
      switch (safeSortBy) {
        case 'earnings':
          return row.totalEarnings;
        case 'canceled':
          return row.canceledDeliveries;
        case 'failed':
          return row.failedDeliveries;
        case 'activeDays':
          return row.activeDays;
        case 'activeHours':
          return row.activeHours;
        case 'deliveries':
        default:
          return row.totalDeliveriesCompleted;
      }
    };

    const sortedRows = mergedRows.sort((firstRow, secondRow) => {
      const firstMetric = metricValue(firstRow);
      const secondMetric = metricValue(secondRow);
      const difference =
        sortDirection === 'asc' ? firstMetric - secondMetric : secondMetric - firstMetric;

      if (difference !== 0) {
        return difference;
      }

      if (safeSortBy !== 'deliveries') {
        const deliveryDifference =
          secondRow.totalDeliveriesCompleted - firstRow.totalDeliveriesCompleted;
        if (deliveryDifference !== 0) {
          return deliveryDifference;
        }
      }

      return (firstRow.riderName ?? '').localeCompare(secondRow.riderName ?? '');
    });

    const rankedRows = sortedRows.map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

    const totalCount = rankedRows.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / sizeNumber) : 0;
    const startIndex = pageNumber * sizeNumber;
    const rows = rankedRows.slice(startIndex, startIndex + sizeNumber);

    return {
      rows,
      totalCount,
      totalPages,
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
