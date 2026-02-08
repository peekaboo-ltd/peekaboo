import { AppDataSource } from '../data-source';
import { Order } from '../entities/order.entity';
import { OrderAssignment } from '../entities/orderAssignment.entity';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { RoleTypes } from '../constants/role.constants';
import { OrderStatus, OrderAssignmentStatus } from '../constants/order.constants';
import { KpayPaymentStatus } from '../types/kpay.types';
import {
  DashboardMetrics,
  AdminMetrics,
  RiderMetrics,
  CustomerMetrics,
  RecentActivity,
  BusinessMetrics,
  ChartDataPoint,
  SummaryChartMetric,
  SummaryChartPeriod,
} from '../types/dashboard.types';
import { UUID } from '../types';
import { UserRole } from '../entities/userRole.entity';
import { OrganizationMembership } from '../entities/organizationMembership.entity';
import { MembershipStatus } from '../constants/organization.constants';

export class DashboardService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderAssignmentRepository = AppDataSource.getRepository(OrderAssignment);
  private paymentRepository = AppDataSource.getRepository(Payment);
  private userRepository = AppDataSource.getRepository(User);
  private userRoleRepository = AppDataSource.getRepository(UserRole);
  private orderActivityRepository = AppDataSource.getRepository(OrderActivity);
  private organizationMembershipRepository = AppDataSource.getRepository(OrganizationMembership);

  /**
   * Determine the primary role for dashboard display
   * Priority: ADMIN > STAFF > BUSINESS > RIDER > CUSTOMER
   */
  private determinePrimaryRole(roles: RoleTypes[]): RoleTypes {
    const rolePriority = [
      RoleTypes.ADMIN,
      RoleTypes.STAFF,
      RoleTypes.BUSINESS,
      RoleTypes.RIDER,
      RoleTypes.CUSTOMER,
    ];
    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return role;
      }
    }
    return RoleTypes.CUSTOMER;
  }

  /**
   * Get dashboard metrics based on user roles
   */
  async getDashboardMetrics(userId: UUID, userRoles: RoleTypes[]): Promise<DashboardMetrics> {
    const primaryRole = this.determinePrimaryRole(userRoles);

    let metrics: AdminMetrics | RiderMetrics | CustomerMetrics | BusinessMetrics;

    switch (primaryRole) {
      case RoleTypes.ADMIN:
      case RoleTypes.STAFF:
        metrics = await this.getAdminMetrics();
        break;
      case RoleTypes.BUSINESS:
        metrics = await this.getBusinessMetrics(userId);
        break;
      case RoleTypes.RIDER:
        metrics = await this.getRiderMetrics(userId);
        break;
      case RoleTypes.CUSTOMER:
      default:
        metrics = await this.getCustomerMetrics(userId);
        break;
    }

    return {
      role: primaryRole,
      metrics,
    };
  }

  /**
   * Get admin/staff metrics (system-wide)
   */
  private async getAdminMetrics(): Promise<AdminMetrics> {
    // Total orders
    const totalOrders = await this.orderRepository.count();

    // Orders by status (using latest activity)
    const ordersByStatus = await this.getOrdersByStatus();

    // Revenue calculations
    const { totalRevenue, revenueThisMonth } = await this.getRevenueMetrics();

    // Assignment metrics
    const activeAssignments = await this.orderAssignmentRepository.count({
      where: { status: OrderAssignmentStatus.ACTIVE },
    });

    const totalAssignments = await this.orderAssignmentRepository.count();

    // Active riders (users with RIDER role who have active assignments)
    const activeRiders = await this.getActiveRidersCount();

    // Total customers
    const totalCustomers = await this.getCustomersCount();

    // Payment metrics
    const pendingPayments = await this.paymentRepository.count({
      where: { status: KpayPaymentStatus.PENDING },
    });

    const completedPayments = await this.paymentRepository.count({
      where: { status: KpayPaymentStatus.SUCCESSFUL },
    });

    // Recent activity
    const recentActivity = await this.getAdminRecentActivity();

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue,
      revenueThisMonth,
      activeAssignments,
      totalAssignments,
      activeRiders,
      totalCustomers,
      pendingPayments,
      completedPayments,
      recentActivity,
    };
  }

  /**
   * Get rider metrics (user-specific)
   */
  private async getRiderMetrics(userId: UUID): Promise<RiderMetrics> {
    // Active assignments for this rider
    const activeAssignments = await this.orderAssignmentRepository.count({
      where: { assignedToId: userId, status: OrderAssignmentStatus.ACTIVE },
    });

    // Completed deliveries
    const completedDeliveries = await this.orderAssignmentRepository.count({
      where: { assignedToId: userId, status: OrderAssignmentStatus.COMPLETED },
    });

    // Pending assignments
    const pendingAssignments = await this.orderAssignmentRepository.count({
      where: { assignedToId: userId, status: OrderAssignmentStatus.PENDING },
    });

    // Deliveries this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const deliveriesThisMonth = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .where('assignment.assignedToId = :userId', { userId })
      .andWhere('assignment.status = :status', { status: OrderAssignmentStatus.COMPLETED })
      .andWhere('assignment.updatedAt >= :startOfMonth', { startOfMonth })
      .getCount();

    // Completion rate (completed / (completed + cancelled))
    const cancelledAssignments = await this.orderAssignmentRepository.count({
      where: { assignedToId: userId, status: OrderAssignmentStatus.CANCELLED },
    });
    const completionDenominator = completedDeliveries + cancelledAssignments;
    const completionRate = completionDenominator > 0
      ? Math.round((completedDeliveries / completionDenominator) * 100)
      : 100;

    // Acceptance rate
    const acceptanceRate = await this.calculateAcceptanceRate(userId);

    // Assignments by status
    const assignmentsByStatus = await this.getAssignmentsByStatus(userId);

    // Recent activity
    const recentActivity = await this.getRiderRecentActivity(userId);

    return {
      activeAssignments,
      completedDeliveries,
      deliveriesThisMonth,
      completionRate,
      acceptanceRate,
      pendingAssignments,
      assignmentsByStatus,
      recentActivity,
    };
  }

  /**
   * Get customer metrics (user-specific)
   */
  private async getCustomerMetrics(userId: UUID): Promise<CustomerMetrics> {
    // Total orders by this customer (as sender or creator)
    const totalOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.senderId = :userId OR order.createdById = :userId', { userId })
      .getCount();

    // Get orders by status for this customer
    const ordersByStatus = await this.getCustomerOrdersByStatus(userId);

    // Active orders
    const activeStatuses = [OrderStatus.CONFIRMED, OrderStatus.ACCEPTED, OrderStatus.PAID, OrderStatus.ACTIVE, OrderStatus.IN_TRANSIT];
    const activeOrders = ordersByStatus
      .filter((s) => activeStatuses.includes(s.status))
      .reduce((sum, s) => sum + s.count, 0);

    // Completed orders
    const completedOrders = ordersByStatus.find((s) => s.status === OrderStatus.COMPLETED)?.count || 0;

    // Orders this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const ordersThisMonth = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.senderId = :userId OR order.createdById = :userId', { userId })
      .andWhere('order.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    // Cancelled orders
    const cancelledOrders = ordersByStatus.find((s) => s.status === OrderStatus.CANCELLED)?.count || 0;

    // Delivery success rate
    const nonCancelledOrders = totalOrders - cancelledOrders;
    const deliverySuccessRate = nonCancelledOrders > 0
      ? Math.round((completedOrders / nonCancelledOrders) * 100)
      : 0;

    // Recent activity
    const recentActivity = await this.getCustomerRecentActivity(userId);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      ordersThisMonth,
      cancelledOrders,
      deliverySuccessRate,
      ordersByStatus,
      recentActivity,
    };
  }

  /**
   * Get business metrics (B2B user-specific)
   * Based on orders created by / sent by the business user, plus organization data.
   */
  private async getBusinessMetrics(userId: UUID): Promise<BusinessMetrics> {
    // Total orders by this business (as sender or creator)
    const totalOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.senderId = :userId OR order.createdById = :userId', { userId })
      .getCount();

    const ordersByStatus = await this.getCustomerOrdersByStatus(userId);

    const activeStatuses = [
      OrderStatus.CREATED,
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.ACCEPTED,
      OrderStatus.PAID,
      OrderStatus.ACTIVE,
      OrderStatus.IN_TRANSIT,
    ];
    const activeOrders = ordersByStatus
      .filter((s) => activeStatuses.includes(s.status))
      .reduce((sum, s) => sum + s.count, 0);

    const deliveredCount = ordersByStatus.find((s) => s.status === OrderStatus.DELIVERED)?.count || 0;
    const completedCount = ordersByStatus.find((s) => s.status === OrderStatus.COMPLETED)?.count || 0;
    const completedOrders = deliveredCount + completedCount;

    // Pending payments
    const pendingPayments = await this.paymentRepository.count({
      where: { createdById: userId, status: KpayPaymentStatus.PENDING },
    });

    // Average order value (from successful payments / completed orders)
    const totalPaidResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.createdById = :userId', { userId })
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .getRawOne();
    const totalPaid = parseFloat(totalPaidResult?.total || '0');
    const averageOrderValue =
      completedOrders > 0 ? Math.round((totalPaid / completedOrders) * 100) / 100 : 0;

    const deliverySuccessRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    // Team members: count active organization memberships for user's organization
    let teamMembers = 0;
    const userMembership = await this.organizationMembershipRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
    });
    if (userMembership) {
      teamMembers = await this.organizationMembershipRepository.count({
        where: { organizationId: userMembership.organizationId, status: MembershipStatus.ACTIVE },
      });
    }

    // Orders this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const ordersThisWeek = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.senderId = :userId OR order.createdById = :userId', { userId })
      .andWhere('order.createdAt >= :startOfWeek', { startOfWeek })
      .getCount();

    const monthlyOrderVolume = await this.getMonthlyOrderVolume(userId);

    const recentActivity = await this.getCustomerRecentActivity(userId);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      teamMembers,
      ordersThisWeek,
      pendingPayments,
      ordersByStatus,
      recentActivity,
      monthlyOrderVolume,
      averageOrderValue,
      deliverySuccessRate,
    };
  }

  private async getMonthlyOrderVolume(userId: UUID): Promise<ChartDataPoint[]> {
    // last 6 months including current
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await this.orderRepository
      .createQueryBuilder('order')
      .select(`TO_CHAR(DATE_TRUNC('month', order.createdAt), 'YYYY-MM')`, 'label')
      .addSelect('COUNT(*)', 'value')
      .where('(order.senderId = :userId OR order.createdById = :userId)', { userId })
      .andWhere('order.createdAt >= :start', { start })
      .groupBy(`DATE_TRUNC('month', order.createdAt)`)
      .orderBy(`DATE_TRUNC('month', order.createdAt)`, 'ASC')
      .getRawMany();

    const byLabel = new Map<string, number>(
      rows.map((r: { label: string; value: string }) => [r.label, parseInt(r.value, 10)])
    );

    const result: ChartDataPoint[] = [];
    const cursor = new Date(start);
    const end = new Date();
    end.setDate(1);
    end.setHours(0, 0, 0, 0);

    while (cursor <= end) {
      const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      result.push({ label, value: byLabel.get(label) || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
  }

  /**
   * Chart data: orders count over time
   */
  async getOrderChartData(userId: UUID, userRoles: RoleTypes[], period: string): Promise<ChartDataPoint[]> {
    const scopeIsAdmin = userRoles.includes(RoleTypes.ADMIN) || userRoles.includes(RoleTypes.STAFF);

    const normalizedPeriod = ['week', 'month', 'year'].includes(period) ? period : 'month';

    const now = new Date();
    let start: Date;
    let truncUnit: 'day' | 'month';
    let format: string;

    if (normalizedPeriod === 'week') {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'day';
      format = 'YYYY-MM-DD';
    } else if (normalizedPeriod === 'year') {
      start = new Date(now);
      start.setMonth(start.getMonth() - 11, 1);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'month';
      format = 'YYYY-MM';
    } else {
      // month
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'day';
      format = 'YYYY-MM-DD';
    }

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .select(`TO_CHAR(DATE_TRUNC('${truncUnit}', order.createdAt), '${format}')`, 'label')
      .addSelect('COUNT(*)', 'value')
      .where('order.createdAt >= :start', { start });

    if (!scopeIsAdmin) {
      qb.andWhere('(order.senderId = :userId OR order.createdById = :userId)', { userId });
    }

    const rows = await qb
      .groupBy(`DATE_TRUNC('${truncUnit}', order.createdAt)`)
      .orderBy(`DATE_TRUNC('${truncUnit}', order.createdAt)`, 'ASC')
      .getRawMany();

    return this.fillTimeSeries(rows, start, now, normalizedPeriod);
  }

  /**
   * Chart data: revenue over time (successful payments)
   */
  async getRevenueChartData(userId: UUID, userRoles: RoleTypes[], period: string): Promise<ChartDataPoint[]> {
    const scopeIsAdmin = userRoles.includes(RoleTypes.ADMIN) || userRoles.includes(RoleTypes.STAFF);

    const normalizedPeriod = ['week', 'month', 'year'].includes(period) ? period : 'month';

    const now = new Date();
    let start: Date;
    let truncUnit: 'day' | 'month';
    let format: string;

    if (normalizedPeriod === 'week') {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'day';
      format = 'YYYY-MM-DD';
    } else if (normalizedPeriod === 'year') {
      start = new Date(now);
      start.setMonth(start.getMonth() - 11, 1);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'month';
      format = 'YYYY-MM';
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'day';
      format = 'YYYY-MM-DD';
    }

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .select(`TO_CHAR(DATE_TRUNC('${truncUnit}', payment.createdAt), '${format}')`, 'label')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'value')
      .where('payment.createdAt >= :start', { start })
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL });

    if (!scopeIsAdmin) {
      qb.andWhere('payment.createdById = :userId', { userId });
    }

    const rows = await qb
      .groupBy(`DATE_TRUNC('${truncUnit}', payment.createdAt)`)
      .orderBy(`DATE_TRUNC('${truncUnit}', payment.createdAt)`, 'ASC')
      .getRawMany();

    return this.fillTimeSeries(rows, start, now, normalizedPeriod, true);
  }

  /**
   * Chart data: deliveries (completed assignments) over time for a rider
   */
  async getDeliveryChartData(userId: UUID, period: string): Promise<ChartDataPoint[]> {
    const normalizedPeriod = ['week', 'month', 'year'].includes(period) ? period : 'month';

    const now = new Date();
    let start: Date;
    let truncUnit: 'day' | 'month';
    let format: string;

    if (normalizedPeriod === 'week') {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'day';
      format = 'YYYY-MM-DD';
    } else if (normalizedPeriod === 'year') {
      start = new Date(now);
      start.setMonth(start.getMonth() - 11, 1);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'month';
      format = 'YYYY-MM';
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      truncUnit = 'day';
      format = 'YYYY-MM-DD';
    }

    const rows = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .select(`TO_CHAR(DATE_TRUNC('${truncUnit}', assignment.updatedAt), '${format}')`, 'label')
      .addSelect('COUNT(*)', 'value')
      .where('assignment.assignedToId = :userId', { userId })
      .andWhere('assignment.status = :status', { status: OrderAssignmentStatus.COMPLETED })
      .andWhere('assignment.updatedAt >= :start', { start })
      .groupBy(`DATE_TRUNC('${truncUnit}', assignment.updatedAt)`)
      .orderBy(`DATE_TRUNC('${truncUnit}', assignment.updatedAt)`, 'ASC')
      .getRawMany();

    return this.fillTimeSeries(rows, start, now, normalizedPeriod);
  }

  /**
   * Summary chart data: unified endpoint for the dashboard summary chart.
   * Dispatches to appropriate aggregation based on metric and period.
   */
  async getSummaryChartData(
    userId: UUID,
    userRoles: RoleTypes[],
    metric: SummaryChartMetric,
    period: SummaryChartPeriod
  ): Promise<ChartDataPoint[]> {
    const isAdmin = userRoles.includes(RoleTypes.ADMIN) || userRoles.includes(RoleTypes.STAFF);
    const isRider = userRoles.includes(RoleTypes.RIDER);

    const { start, truncUnit, format } = this.getSummaryPeriodConfig(period);
    const now = new Date();

    switch (metric) {
      case 'ORDERS': {
        const qb = this.orderRepository
          .createQueryBuilder('order')
          .select(`TO_CHAR(DATE_TRUNC('${truncUnit}', order.createdAt), '${format}')`, 'label')
          .addSelect('COUNT(*)', 'value')
          .where('order.createdAt >= :start', { start });

        if (!isAdmin) {
          qb.andWhere('(order.senderId = :userId OR order.createdById = :userId)', { userId });
        }

        const rows = await qb
          .groupBy(`DATE_TRUNC('${truncUnit}', order.createdAt)`)
          .orderBy(`DATE_TRUNC('${truncUnit}', order.createdAt)`, 'ASC')
          .getRawMany();

        return period === '90d'
          ? this.fillWeeklyTimeSeries(rows, start, now)
          : this.fillTimeSeries(rows, start, now, period === '7d' ? 'week' : 'month');
      }

      case 'REVENUE': {
        const qb = this.paymentRepository
          .createQueryBuilder('payment')
          .select(`TO_CHAR(DATE_TRUNC('${truncUnit}', payment.createdAt), '${format}')`, 'label')
          .addSelect('COALESCE(SUM(payment.amount), 0)', 'value')
          .where('payment.createdAt >= :start', { start })
          .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL });

        if (!isAdmin) {
          qb.andWhere('payment.createdById = :userId', { userId });
        }

        const rows = await qb
          .groupBy(`DATE_TRUNC('${truncUnit}', payment.createdAt)`)
          .orderBy(`DATE_TRUNC('${truncUnit}', payment.createdAt)`, 'ASC')
          .getRawMany();

        return period === '90d'
          ? this.fillWeeklyTimeSeries(rows, start, now, true)
          : this.fillTimeSeries(rows, start, now, period === '7d' ? 'week' : 'month', true);
      }

      case 'DELIVERIES': {
        const qb = this.orderAssignmentRepository
          .createQueryBuilder('assignment')
          .select(`TO_CHAR(DATE_TRUNC('${truncUnit}', assignment.updatedAt), '${format}')`, 'label')
          .addSelect('COUNT(*)', 'value')
          .where('assignment.status = :status', { status: OrderAssignmentStatus.COMPLETED })
          .andWhere('assignment.updatedAt >= :start', { start });

        if (!isAdmin) {
          if (isRider) {
            qb.andWhere('assignment.assignedToId = :userId', { userId });
          } else {
            qb.innerJoin('assignment.order', 'order')
              .andWhere('(order.senderId = :userId OR order.createdById = :userId)', { userId });
          }
        }

        const rows = await qb
          .groupBy(`DATE_TRUNC('${truncUnit}', assignment.updatedAt)`)
          .orderBy(`DATE_TRUNC('${truncUnit}', assignment.updatedAt)`, 'ASC')
          .getRawMany();

        return period === '90d'
          ? this.fillWeeklyTimeSeries(rows, start, now)
          : this.fillTimeSeries(rows, start, now, period === '7d' ? 'week' : 'month');
      }

      case 'ACTIVE_USERS': {
        if (!isAdmin) return [];

        const rows: Array<{ label: string; value: string }> = await AppDataSource.query(
          `SELECT label, COUNT(DISTINCT user_id)::int as value FROM (
            SELECT TO_CHAR(DATE_TRUNC($1, created_at), $2) as label, created_by_id as user_id
            FROM orders WHERE created_at >= $3
            UNION ALL
            SELECT TO_CHAR(DATE_TRUNC($1, created_at), $2) as label, created_by_id as user_id
            FROM payments WHERE created_at >= $3
            UNION ALL
            SELECT TO_CHAR(DATE_TRUNC($1, updated_at), $2) as label, assigned_to_id as user_id
            FROM order_assignments WHERE updated_at >= $3
          ) combined
          GROUP BY label
          ORDER BY label ASC`,
          [truncUnit, format, start]
        );

        return period === '90d'
          ? this.fillWeeklyTimeSeries(rows, start, now)
          : this.fillTimeSeries(rows, start, now, period === '7d' ? 'week' : 'month');
      }

      default:
        return [];
    }
  }

  private getSummaryPeriodConfig(period: SummaryChartPeriod): {
    start: Date;
    truncUnit: string;
    format: string;
  } {
    const now = new Date();

    switch (period) {
      case '7d': {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return { start, truncUnit: 'day', format: 'YYYY-MM-DD' };
      }
      case '90d': {
        const start = new Date(now);
        start.setDate(start.getDate() - 89);
        start.setHours(0, 0, 0, 0);
        return { start, truncUnit: 'week', format: 'IYYY-"W"IW' };
      }
      case '30d':
      default: {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        return { start, truncUnit: 'day', format: 'YYYY-MM-DD' };
      }
    }
  }

  private fillWeeklyTimeSeries(
    rows: Array<{ label: string; value: string }>,
    start: Date,
    end: Date,
    parseAsFloat: boolean = false
  ): ChartDataPoint[] {
    const byLabel = new Map<string, number>(
      rows.map((r) => [r.label, parseAsFloat ? parseFloat(r.value) : parseInt(String(r.value), 10)])
    );

    const result: ChartDataPoint[] = [];
    const cursor = new Date(start);
    // Align cursor to Monday (ISO week start)
    const dayOfWeek = cursor.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    cursor.setDate(cursor.getDate() + diff);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= end) {
      const label = this.getISOWeekLabel(cursor);
      result.push({ label, value: byLabel.get(label) || 0 });
      cursor.setDate(cursor.getDate() + 7);
    }

    return result;
  }

  private getISOWeekLabel(date: Date): string {
    // Calculate ISO week number and year
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 4);
    const weekNumber = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7
    );
    // ISO year: if the week belongs to the next year's first week, use next year
    const isoYear = d.getFullYear();
    return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;
  }

  private fillTimeSeries(
    rows: Array<{ label: string; value: string }>,
    start: Date,
    end: Date,
    period: string,
    parseAsFloat: boolean = false
  ): ChartDataPoint[] {
    const byLabel = new Map<string, number>(
      rows.map((r) => [r.label, parseAsFloat ? parseFloat(r.value) : parseInt(r.value, 10)])
    );

    const result: ChartDataPoint[] = [];

    if (period === 'year') {
      const cursor = new Date(start);
      cursor.setDate(1);
      cursor.setHours(0, 0, 0, 0);
      const endCursor = new Date(end);
      endCursor.setDate(1);
      endCursor.setHours(0, 0, 0, 0);

      while (cursor <= endCursor) {
        const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        result.push({ label, value: byLabel.get(label) || 0 });
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return result;
    }

    // week/month -> daily
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const endCursor = new Date(end);
    endCursor.setHours(0, 0, 0, 0);

    while (cursor <= endCursor) {
      const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
        cursor.getDate()
      ).padStart(2, '0')}`;
      result.push({ label, value: byLabel.get(label) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  /**
   * Get orders grouped by their latest status
   */
  private async getOrdersByStatus() {
    // Get the latest activity for each order
    const result = await this.orderActivityRepository
      .createQueryBuilder('activity')
      .select('activity.status', 'status')
      .addSelect('COUNT(DISTINCT activity.orderId)', 'count')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(sub.createdAt)')
          .from(OrderActivity, 'sub')
          .where('sub.orderId = activity.orderId')
          .getQuery();
        return 'activity.createdAt = ' + subQuery;
      })
      .groupBy('activity.status')
      .getRawMany();

    return result.map((r) => ({
      status: r.status as OrderStatus,
      count: parseInt(r.count, 10),
    }));
  }

  /**
   * Get orders by status for a specific customer
   */
  private async getCustomerOrdersByStatus(userId: UUID) {
    const result = await this.orderActivityRepository
      .createQueryBuilder('activity')
      .innerJoin('activity.order', 'order')
      .select('activity.status', 'status')
      .addSelect('COUNT(DISTINCT activity.orderId)', 'count')
      .where('order.senderId = :userId OR order.createdById = :userId', { userId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(sub.createdAt)')
          .from(OrderActivity, 'sub')
          .where('sub.orderId = activity.orderId')
          .getQuery();
        return 'activity.createdAt = ' + subQuery;
      })
      .groupBy('activity.status')
      .getRawMany();

    return result.map((r) => ({
      status: r.status as OrderStatus,
      count: parseInt(r.count, 10),
    }));
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics() {
    // Total revenue from successful payments
    const totalRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .getRawOne();

    // Revenue this month
    const revenueThisMonthResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .andWhere('payment.createdAt >= DATE_TRUNC(\'month\', CURRENT_DATE)')
      .getRawOne();

    return {
      totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
      revenueThisMonth: parseFloat(revenueThisMonthResult?.total || '0'),
    };
  }

  /**
   * Get count of active riders
   */
  private async getActiveRidersCount(): Promise<number> {
    const result = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role')
      .innerJoin('userRole.user', 'user')
      .where('role.name = :roleName', { roleName: RoleTypes.RIDER })
      .andWhere('user.status = :status', { status: 'ACTIVE' })
      .getCount();

    return result;
  }

  /**
   * Get count of customers
   */
  private async getCustomersCount(): Promise<number> {
    const result = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role')
      .where('role.name = :roleName', { roleName: RoleTypes.CUSTOMER })
      .getCount();

    return result;
  }

  /**
   * Calculate acceptance rate for a rider
   */
  private async calculateAcceptanceRate(userId: UUID): Promise<number> {
    const totalAssignments = await this.orderAssignmentRepository.count({
      where: { assignedToId: userId },
    });

    if (totalAssignments === 0) return 100;

    const rejectedAssignments = await this.orderAssignmentRepository.count({
      where: { assignedToId: userId, status: OrderAssignmentStatus.REJECTED },
    });

    return Math.round(((totalAssignments - rejectedAssignments) / totalAssignments) * 100);
  }

  /**
   * Get assignments by status for a rider
   */
  private async getAssignmentsByStatus(userId: UUID) {
    const result = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .select('assignment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('assignment.assignedToId = :userId', { userId })
      .groupBy('assignment.status')
      .getRawMany();

    return result.map((r) => ({
      status: r.status as OrderAssignmentStatus,
      count: parseInt(r.count, 10),
    }));
  }

  /**
   * Get admin recent activity
   */
  private async getAdminRecentActivity(): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Recent orders
    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.activities', 'activities')
      .orderBy('order.createdAt', 'DESC')
      .take(5)
      .getMany();

    recentOrders.forEach((order) => {
      const latestActivity = order.activities?.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      activities.push({
        id: order.id,
        type: 'order',
        title: `Order ${order.referenceId}`,
        description: `Order created`,
        status: latestActivity?.status || OrderStatus.CREATED,
        timestamp: order.createdAt,
      });
    });

    // Recent payments
    const recentPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .orderBy('payment.createdAt', 'DESC')
      .take(5)
      .getMany();

    recentPayments.forEach((payment) => {
      activities.push({
        id: payment.id,
        type: 'payment',
        title: `Payment ${payment.internalReferenceId}`,
        description: `${payment.amount} ${payment.currency}`,
        status: payment.status,
        timestamp: payment.createdAt,
      });
    });

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  /**
   * Get rider recent activity
   */
  private async getRiderRecentActivity(userId: UUID): Promise<RecentActivity[]> {
    const assignments = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.order', 'order')
      .where('assignment.assignedToId = :userId', { userId })
      .orderBy('assignment.updatedAt', 'DESC')
      .take(10)
      .getMany();

    return assignments.map((assignment) => ({
      id: assignment.id,
      type: 'assignment' as const,
      title: `Assignment for ${assignment.order.referenceId}`,
      description: assignment.description || 'Delivery assignment',
      status: assignment.status,
      timestamp: assignment.updatedAt,
    }));
  }

  /**
   * Get customer recent activity
   */
  private async getCustomerRecentActivity(userId: UUID): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Recent orders
    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.activities', 'activities')
      .where('order.senderId = :userId OR order.createdById = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .take(5)
      .getMany();

    recentOrders.forEach((order) => {
      const latestActivity = order.activities?.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      activities.push({
        id: order.id,
        type: 'order',
        title: `Order ${order.referenceId}`,
        description: `Your order`,
        status: latestActivity?.status || OrderStatus.CREATED,
        timestamp: order.createdAt,
      });
    });

    // Recent payments
    const recentPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.createdById = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .take(5)
      .getMany();

    recentPayments.forEach((payment) => {
      activities.push({
        id: payment.id,
        type: 'payment',
        title: `Payment`,
        description: `${payment.amount} ${payment.currency}`,
        status: payment.status,
        timestamp: payment.createdAt,
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }
}
