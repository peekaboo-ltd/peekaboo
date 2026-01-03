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
} from '../types/dashboard.types';
import { UUID } from '../types';
import { UserRole } from '../entities/userRole.entity';

export class DashboardService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderAssignmentRepository = AppDataSource.getRepository(OrderAssignment);
  private paymentRepository = AppDataSource.getRepository(Payment);
  private userRepository = AppDataSource.getRepository(User);
  private userRoleRepository = AppDataSource.getRepository(UserRole);
  private orderActivityRepository = AppDataSource.getRepository(OrderActivity);

  /**
   * Determine the primary role for dashboard display
   * Priority: ADMIN > STAFF > RIDER > CUSTOMER
   */
  private determinePrimaryRole(roles: RoleTypes[]): RoleTypes {
    const rolePriority = [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.RIDER, RoleTypes.CUSTOMER];
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

    let metrics: AdminMetrics | RiderMetrics | CustomerMetrics;

    switch (primaryRole) {
      case RoleTypes.ADMIN:
      case RoleTypes.STAFF:
        metrics = await this.getAdminMetrics();
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

    // Earnings calculations
    const { earningsThisMonth, totalEarnings } = await this.getRiderEarnings(userId);

    // Acceptance rate
    const acceptanceRate = await this.calculateAcceptanceRate(userId);

    // Assignments by status
    const assignmentsByStatus = await this.getAssignmentsByStatus(userId);

    // Recent activity
    const recentActivity = await this.getRiderRecentActivity(userId);

    return {
      activeAssignments,
      completedDeliveries,
      earningsThisMonth,
      totalEarnings,
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
    const activeStatuses = [OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ACCEPTED, OrderStatus.PAID, OrderStatus.ACTIVE, OrderStatus.IN_TRANSIT];
    const activeOrders = ordersByStatus
      .filter((s) => activeStatuses.includes(s.status))
      .reduce((sum, s) => sum + s.count, 0);

    // Completed orders
    const completedOrders = ordersByStatus.find((s) => s.status === OrderStatus.COMPLETED)?.count || 0;

    // Total spent
    const totalSpentResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.createdById = :userId', { userId })
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .getRawOne();

    const totalSpent = parseFloat(totalSpentResult?.total || '0');

    // Pending payments
    const pendingPayments = await this.paymentRepository.count({
      where: { createdById: userId, status: KpayPaymentStatus.PENDING },
    });

    // Recent activity
    const recentActivity = await this.getCustomerRecentActivity(userId);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent,
      pendingPayments,
      ordersByStatus,
      recentActivity,
    };
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
   * Get rider earnings
   */
  private async getRiderEarnings(userId: UUID) {
    // Get completed orders for this rider
    const completedAssignments = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.order', 'order')
      .where('assignment.assignedToId = :userId', { userId })
      .andWhere('assignment.status = :status', { status: OrderAssignmentStatus.COMPLETED })
      .getMany();

    const totalEarnings = completedAssignments.reduce(
      (sum, a) => sum + (parseFloat(String(a.order.finalFee)) || 0),
      0
    );

    // This month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthAssignments = completedAssignments.filter(
      (a) => new Date(a.updatedAt) >= startOfMonth
    );

    const earningsThisMonth = thisMonthAssignments.reduce(
      (sum, a) => sum + (parseFloat(String(a.order.finalFee)) || 0),
      0
    );

    return { earningsThisMonth, totalEarnings };
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
