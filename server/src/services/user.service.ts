import { FindOptionsWhere, Repository, Like, In, ILike, IsNull, Not } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
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
import { UserStatusProof } from '../entities/userStatusProof.entity';
import { UserProblemReport } from '../entities/userProblemReport.entity';


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

interface RiderPerformanceListItem {
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
}

interface RiderAttendanceListItem {
  id: UUID;
  riderId: UUID;
  riderName?: string;
  riderPhoneNumber?: string;
  date: string;
  status: UserStatus;
  timestamp: string;
  imageUrl: string;
  locationLabel?: string;
}

interface RiderProblemReportListItem {
  id: UUID;
  riderId: UUID;
  riderName?: string;
  riderPhoneNumber?: string;
  imageUrl: string;
  mediaType: 'photo' | 'video';
  submissionType: 'PROBLEM' | 'RECEIPT';
  description?: string;
  timestamp: string;
  locationLabel?: string;
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
  private readonly userStatusProofRepository: Repository<UserStatusProof>;
  private readonly userProblemReportRepository: Repository<UserProblemReport>;
  private readonly userRoleService: UserRoleService;
  private readonly organizationMembershipService: OrganizationMembershipService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.orderAssignmentRepository = AppDataSource.getRepository(OrderAssignment);
    this.userStatusProofRepository = AppDataSource.getRepository(UserStatusProof);
    this.userProblemReportRepository = AppDataSource.getRepository(UserProblemReport);
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
  ): Promise<Pagination<RiderPerformanceListItem>> {
    const { page = 0, size = 10, search, status, timeframe = 'monthly', startDate, endDate, sortBy = 'deliveries', sortOrder = 'desc' } = query;
    const pageNumber = Number(page) >= 0 ? Number(page) : 0;
    const sizeNumber = Number(size) > 0 ? Number(size) : 10;
    const sortDirection = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    const normalizedSortBy = String(sortBy) as RiderManagementSortBy;
    const allowedSortBy: RiderManagementSortBy[] = ['deliveries', 'earnings', 'canceled', 'failed', 'activeDays', 'activeHours'];
    const safeSortBy = allowedSortBy.includes(normalizedSortBy) ? normalizedSortBy : 'deliveries';

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

    let fromDate: Date | undefined;
    let toDate: Date | undefined;
    const now = new Date();

    if (timeframeValue === 'daily') {
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
    } else if (timeframeValue === 'weekly') {
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 7);
    } else if (timeframeValue === 'monthly') {
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

    const riders = await this.buildRidersBaseQuery({
      searchValue,
      statusValue,
    }).getMany();
    const riderIds = riders.map((rider) => rider.id);

    const emptyResponse: Pagination<RiderPerformanceListItem> = {
      rows: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: pageNumber + 1,
      size: sizeNumber,
      page: pageNumber,
    };
    if (!riderIds.length) return emptyResponse;

    const assignmentStatsQueryBuilder = this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.order', 'order')
      .select('assignment.assignedToId', 'riderId')
      .addSelect(`SUM(CASE WHEN assignment.status = :completedStatus THEN 1 ELSE 0 END)`, 'totalDeliveriesCompleted')
      .addSelect(`COALESCE(SUM(CASE WHEN assignment.status = :completedStatus THEN COALESCE(order.finalFee, order.initialFee, 0) ELSE 0 END), 0)`, 'totalEarnings')
      .addSelect(`SUM(CASE WHEN assignment.status = :cancelledStatus THEN 1 ELSE 0 END)`, 'canceledDeliveries')
      .addSelect(`SUM(CASE WHEN assignment.status = :failedStatus THEN 1 ELSE 0 END)`, 'failedDeliveries')
      .addSelect(`COUNT(DISTINCT DATE_TRUNC('day', assignment.updatedAt))`, 'activeDays')
      .addSelect(`COUNT(DISTINCT DATE_TRUNC('hour', assignment.updatedAt))`, 'activeHours')
      .where('assignment.assignedToId IN (:...riderIds)', { riderIds })
      .setParameters({
        completedStatus: OrderAssignmentStatus.COMPLETED,
        cancelledStatus: OrderAssignmentStatus.CANCELLED,
        failedStatus: OrderAssignmentStatus.REJECTED,
      });

    if (fromDate) assignmentStatsQueryBuilder.andWhere('assignment.updatedAt >= :fromDate', { fromDate });
    if (toDate) assignmentStatsQueryBuilder.andWhere('assignment.updatedAt <= :toDate', { toDate });

    const assignmentStats = await assignmentStatsQueryBuilder.groupBy('assignment.assignedToId').getRawMany<{
      riderId: UUID;
      totalDeliveriesCompleted: string;
      totalEarnings: string;
      canceledDeliveries: string;
      failedDeliveries: string;
      activeDays: string;
      activeHours: string;
    }>();

    const statsMap = new Map(assignmentStats.map((stats) => [stats.riderId, stats]));
    const mergedRows: RiderPerformanceListItem[] = riders.map((rider) => {
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
      };
    });

    const metricValue = (row: RiderPerformanceListItem): number => {
      switch (safeSortBy) {
        case 'earnings': return row.totalEarnings;
        case 'canceled': return row.canceledDeliveries;
        case 'failed': return row.failedDeliveries;
        case 'activeDays': return row.activeDays;
        case 'activeHours': return row.activeHours;
        case 'deliveries':
        default: return row.totalDeliveriesCompleted;
      }
    };

    const sortedRows = mergedRows.sort((a, b) => {
      const diff = sortDirection === 'asc' ? metricValue(a) - metricValue(b) : metricValue(b) - metricValue(a);
      if (diff !== 0) return diff;
      if (safeSortBy !== 'deliveries') {
        const deliveriesDiff = b.totalDeliveriesCompleted - a.totalDeliveriesCompleted;
        if (deliveriesDiff !== 0) return deliveriesDiff;
      }
      return (a.riderName ?? '').localeCompare(b.riderName ?? '');
    });

    const rankedRows = sortedRows.map((row, index) => ({ ...row, rank: index + 1 }));
    const totalCount = rankedRows.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / sizeNumber) : 0;
    const startIndex = pageNumber * sizeNumber;

    return {
      rows: rankedRows.slice(startIndex, startIndex + sizeNumber),
      totalCount,
      totalPages,
      currentPage: pageNumber + 1,
      size: sizeNumber,
      page: pageNumber,
    };
  }

  async getRiderManagementAttendance(
    query: Request['query']
  ): Promise<Pagination<RiderAttendanceListItem>> {
    const { page = 0, size = 10, attendanceDate, name, riderId } = query;
    const pageNumber = Number(page) >= 0 ? Number(page) : 0;
    const sizeNumber = Number(size) > 0 ? Number(size) : 10;

    const attendanceDateValue = typeof attendanceDate === 'string' && attendanceDate.trim() ? attendanceDate.trim() : undefined;
    const nameValue = typeof name === 'string' && name.trim() ? name.trim() : undefined;
    const riderIdValue = typeof riderId === 'string' && riderId.trim() ? riderId.trim() : undefined;

    const baseDate = attendanceDateValue ? new Date(attendanceDateValue) : new Date();
    const safeDate = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate;
    const attendanceStart = new Date(safeDate);
    attendanceStart.setHours(0, 0, 0, 0);
    const attendanceEnd = new Date(safeDate);
    attendanceEnd.setHours(23, 59, 59, 999);
    const riders = await this.buildRidersBaseQuery({
      nameValue,
      riderIdValue,
    }).getMany();
    const riderIds = riders.map((rider) => rider.id);
    if (!riderIds.length) {
      return { rows: [], totalCount: 0, totalPages: 0, currentPage: pageNumber + 1, size: sizeNumber, page: pageNumber };
    }

    const proofs = await this.userStatusProofRepository.createQueryBuilder('proof')
      .leftJoinAndSelect('proof.user', 'user')
      .where('proof.userId IN (:...riderIds)', { riderIds })
      .andWhere('proof.capturedAt >= :attendanceStart', { attendanceStart })
      .andWhere('proof.capturedAt <= :attendanceEnd', { attendanceEnd })
      .orderBy('proof.capturedAt', 'DESC')
      .getMany();

    const rows = proofs.map<RiderAttendanceListItem>((proof) => {
      const proofDate = proof.capturedAt;
      const date = `${proofDate.getFullYear()}-${String(proofDate.getMonth() + 1).padStart(2, '0')}-${String(proofDate.getDate()).padStart(2, '0')}`;
      return {
        id: proof.id,
        riderId: proof.userId,
        riderName: proof.user?.name,
        riderPhoneNumber: proof.user?.phoneNumber,
        date,
        status: proof.status,
        timestamp: proof.capturedAt.toISOString(),
        imageUrl: proof.imageUrl,
        locationLabel: proof.locationLabel,
      };
    });

    const totalCount = rows.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / sizeNumber) : 0;
    const startIndex = pageNumber * sizeNumber;

    return {
      rows: rows.slice(startIndex, startIndex + sizeNumber),
      totalCount,
      totalPages,
      currentPage: pageNumber + 1,
      size: sizeNumber,
      page: pageNumber,
    };
  }

  async getRiderManagementProblemReports(
    query: Request['query']
  ): Promise<Pagination<RiderProblemReportListItem>> {
    const { page = 0, size = 10, attendanceDate, riderId, name } = query;
    const pageNumber = Number(page) >= 0 ? Number(page) : 0;
    const sizeNumber = Number(size) > 0 ? Number(size) : 10;

    const riderIdValue = typeof riderId === 'string' && riderId.trim() ? riderId.trim() : undefined;
    const attendanceDateValue = typeof attendanceDate === 'string' && attendanceDate.trim() ? attendanceDate.trim() : undefined;
    const nameValue = typeof name === 'string' && name.trim() ? name.trim() : undefined;

    const reportQuery = this.userProblemReportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('role.name = :riderRole', { riderRole: RoleTypes.RIDER });

    if (riderIdValue) {
      reportQuery.andWhere('report.userId = :riderId', { riderId: riderIdValue });
    }
    if (nameValue) {
      reportQuery.andWhere('user.name ILIKE :name', { name: `%${nameValue}%` });
    }

    if (attendanceDateValue) {
      const baseDate = new Date(attendanceDateValue);
      if (!Number.isNaN(baseDate.getTime())) {
        const start = new Date(baseDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(baseDate);
        end.setHours(23, 59, 59, 999);
        reportQuery.andWhere('report.capturedAt >= :start', { start }).andWhere('report.capturedAt <= :end', { end });
      }
    }

    const [reports, totalCount] = await reportQuery
      .orderBy('report.capturedAt', 'DESC')
      .skip(pageNumber * sizeNumber)
      .take(sizeNumber)
      .getManyAndCount();

    const rows = reports.map<RiderProblemReportListItem>((report) => ({
      id: report.id,
      riderId: report.userId,
      riderName: report.user?.name,
      riderPhoneNumber: report.user?.phoneNumber,
      imageUrl: report.imageUrl,
      mediaType: report.mediaType,
      submissionType: report.submissionType,
      description: report.description,
      timestamp: report.capturedAt.toISOString(),
      locationLabel: report.locationLabel,
    }));

    return {
      rows,
      totalCount,
      totalPages: totalCount > 0 ? Math.ceil(totalCount / sizeNumber) : 0,
      currentPage: pageNumber + 1,
      size: sizeNumber,
      page: pageNumber,
    };
  }

  async createStatusProof(payload: {
    userId: UUID;
    imageUrl: string;
    status: UserStatus;
    capturedAt: string;
    locationLabel?: string;
    latitude?: number;
    longitude?: number;
    overlayApplied?: boolean;
    overlayVersion?: string;
    overlaySource?: string;
  }): Promise<UserStatusProof> {
    return this.userStatusProofRepository.save({
      userId: payload.userId,
      imageUrl: payload.imageUrl,
      status: payload.status,
      capturedAt: new Date(payload.capturedAt),
      locationLabel: payload.locationLabel,
      latitude: payload.latitude,
      longitude: payload.longitude,
      overlayApplied: Boolean(payload.overlayApplied),
      overlayVersion: payload.overlayVersion,
      overlaySource: payload.overlaySource,
    });
  }

  async createProblemReport(payload: {
    userId: UUID;
    imageUrl: string;
    mediaType: 'photo' | 'video';
    submissionType: 'PROBLEM' | 'RECEIPT';
    description: string;
    capturedAt: string;
    locationLabel?: string;
    source?: string;
    overlayApplied?: boolean;
    overlayVersion?: string;
    overlaySource?: string;
  }): Promise<UserProblemReport> {
    return this.userProblemReportRepository.save({
      userId: payload.userId,
      imageUrl: payload.imageUrl,
      mediaType: payload.mediaType,
      submissionType: payload.submissionType,
      description: payload.description,
      capturedAt: new Date(payload.capturedAt),
      locationLabel: payload.locationLabel,
      source: payload.source,
      overlayApplied: Boolean(payload.overlayApplied),
      overlayVersion: payload.overlayVersion,
      overlaySource: payload.overlaySource,
    });
  }

  private buildRidersBaseQuery(filters: {
    searchValue?: string;
    statusValue?: string;
    nameValue?: string;
    riderIdValue?: string;
  }) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('role.name = :riderRole', { riderRole: RoleTypes.RIDER });

    if (filters.searchValue) {
      queryBuilder.andWhere('(user.name ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)', {
        search: `%${filters.searchValue}%`,
      });
    }
    if (filters.nameValue) {
      queryBuilder.andWhere('user.name ILIKE :name', {
        name: `%${filters.nameValue}%`,
      });
    }
    if (filters.riderIdValue) {
      queryBuilder.andWhere('user.id = :riderId', { riderId: filters.riderIdValue });
    }
    const allowedStatuses = Object.values(UserStatus);
    if (filters.statusValue && allowedStatuses.includes(filters.statusValue as UserStatus)) {
      queryBuilder.andWhere('user.status = :status', {
        status: filters.statusValue as UserStatus,
      });
    }

    return queryBuilder;
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
