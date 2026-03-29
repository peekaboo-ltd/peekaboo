import { AppDataSource } from '../data-source';
import { Order } from '../entities/order.entity';
import { OrderAssignment } from '../entities/orderAssignment.entity';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { RoleTypes } from '../constants/role.constants';
import { OrderStatus, OrderAssignmentStatus } from '../constants/order.constants';
import { TierBreakdown } from '../constants/businessPlan.constants';
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
  BusinessReportData,
  BusinessReportPieSlice,
} from '../types/dashboard.types';
import { UUID } from '../types';
import { UserRole } from '../entities/userRole.entity';
import { OrganizationMembership } from '../entities/organizationMembership.entity';
import { BillingStatus, MembershipStatus } from '../constants/organization.constants';
import { OrganizationBilling } from '../entities/organizationBilling.entity';
import { calculateBillingTotal } from '../helpers/pricing.helper';

const REPORT_PIE_COLORS = ['#0f766e', '#1d4ed8', '#d97706', '#be123c', '#475569'];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildLineChartSvg = (points: ChartDataPoint[]) => {
  if (!points.length) {
    return '<div style="color:#64748b;font-size:12px;">No chart data available</div>';
  }

  const width = 680;
  const height = 220;
  const padding = 24;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const maxValue = Math.max(1, ...points.map((p) => Number(p.value) || 0));

  const coords = points.map((point, index) => {
    const x = padding + (plotWidth * index) / Math.max(1, points.length - 1);
    const y = padding + plotHeight - (plotHeight * (Number(point.value) || 0)) / maxValue;
    return { x, y, label: point.label, value: Number(point.value) || 0 };
  });

  const path = coords.map((c, index) => `${index === 0 ? 'M' : 'L'}${c.x} ${c.y}`).join(' ');
  const dots = coords
    .map((c) => `<circle cx="${c.x}" cy="${c.y}" r="3" fill="#0f766e" />`)
    .join('');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Deliveries trend line chart">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#f8fafc" rx="12" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1" />
      <path d="${path}" fill="none" stroke="#0f766e" stroke-width="3" />
      ${dots}
      <text x="${padding}" y="${height - 6}" font-size="11" fill="#64748b">${escapeHtml(coords[0]?.label || '')}</text>
      <text x="${width - padding}" y="${height - 6}" text-anchor="end" font-size="11" fill="#64748b">${escapeHtml(coords[coords.length - 1]?.label || '')}</text>
    </svg>
  `;
};

const buildPieChartSvg = (slices: BusinessReportPieSlice[]) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (!total) {
    return '<div style="color:#64748b;font-size:12px;">No status distribution available</div>';
  }

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 82;

  const toPoint = (angle: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  let cumulative = -Math.PI / 2;
  const paths = slices
    .map((slice, index) => {
      const angle = (slice.value / total) * Math.PI * 2;
      const start = toPoint(cumulative);
      const end = toPoint(cumulative + angle);
      const largeArc = angle > Math.PI ? 1 : 0;
      cumulative += angle;
      return `<path d="M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z" fill="${slice.color || REPORT_PIE_COLORS[index % REPORT_PIE_COLORS.length]}" />`;
    })
    .join('');

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Assignment status pie chart">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="36" fill="#ffffff" />
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="11" fill="#0f172a" font-weight="700">${total}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="#64748b">Total</text>
    </svg>
  `;
};

export class DashboardService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderAssignmentRepository = AppDataSource.getRepository(OrderAssignment);
  private paymentRepository = AppDataSource.getRepository(Payment);
  private userRepository = AppDataSource.getRepository(User);
  private userRoleRepository = AppDataSource.getRepository(UserRole);
  private orderActivityRepository = AppDataSource.getRepository(OrderActivity);
  private organizationMembershipRepository = AppDataSource.getRepository(OrganizationMembership);
  private organizationBillingRepository = AppDataSource.getRepository(OrganizationBilling);

  private resolveBillingBreakdown(
    billing: Pick<
      OrganizationBilling,
      'pricingSnapshot' | 'tierBreakdown' | 'totalOrders' | 'totalAmount'
    >
  ): { breakdown: TierBreakdown[]; totalAmount: number } {
    if (billing.pricingSnapshot?.tiers?.length) {
      const result = calculateBillingTotal(
        billing.pricingSnapshot,
        billing.totalOrders,
      );
      return {
        breakdown: result.breakdown,
        totalAmount: result.total,
      };
    }

    return {
      breakdown: billing.tierBreakdown ?? [],
      totalAmount: Number(billing.totalAmount),
    };
  }

  private async getPrioritizedBilling(organizationId: UUID): Promise<{
    billing?: OrganizationBilling;
    breakdown: TierBreakdown[];
    totalAmount: number;
    planName?: string;
  }> {
    const dueBillings = await this.organizationBillingRepository.find({
      where: {
        organizationId,
        status: BillingStatus.PENDING,
      },
      relations: { businessPlan: true },
      order: {
        periodEnd: 'DESC',
        createdAt: 'DESC',
      },
    });

    const actionableBillings = await this.organizationBillingRepository.find({
      where: [
        { organizationId, status: BillingStatus.INVOICED },
        { organizationId, status: BillingStatus.OVERDUE },
      ],
      relations: { businessPlan: true },
      order: {
        periodEnd: 'DESC',
        createdAt: 'DESC',
      },
    });

    const orderedBillings = [...actionableBillings, ...dueBillings];
    const prioritizedBilling =
      orderedBillings.find(
        (billing) =>
          billing.status === BillingStatus.INVOICED ||
          billing.status === BillingStatus.OVERDUE ||
          (billing.status === BillingStatus.PENDING &&
            new Date(billing.periodEnd).getTime() < Date.now()),
      ) || orderedBillings[0];

    if (!prioritizedBilling) {
      return {
        breakdown: [],
        totalAmount: 0,
      };
    }

    const resolvedBilling = this.resolveBillingBreakdown(prioritizedBilling);

    return {
      billing: prioritizedBilling,
      breakdown: resolvedBilling.breakdown,
      totalAmount: resolvedBilling.totalAmount,
      planName: prioritizedBilling.businessPlan?.name,
    };
  }

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
    const { totalRevenue, billingAndPaymentsThisMonth } = await this.getRevenueMetrics();

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

    const pendingAssignments = await this.orderAssignmentRepository.count({
      where: { status: OrderAssignmentStatus.PENDING },
    });
    const pendingStatuses = pendingAssignments;

    // Recent activity
    const recentActivity = await this.getAdminRecentActivity();

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue,
      billingAndPaymentsThisMonth,
      pendingStatuses,
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
    const pendingOrders =
      ordersByStatus.find((s) => s.status === OrderStatus.PENDING)?.count || 0;

    const activeStatuses = [
      OrderStatus.CONFIRMED,
      OrderStatus.ACCEPTED,
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
    const completedPayments = await this.paymentRepository.count({
      where: { createdById: userId, status: KpayPaymentStatus.SUCCESSFUL },
    });
    const billingAndPaymentsThisMonthResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.createdById = :userId', { userId })
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .andWhere('payment.createdAt >= DATE_TRUNC(\'month\', CURRENT_DATE)')
      .getRawOne();
    const billingAndPaymentsThisMonth = parseFloat(
      billingAndPaymentsThisMonthResult?.total || '0'
    );

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
    let currentAmountDue = 0;
    const userMembership = await this.organizationMembershipRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
    });
    if (userMembership) {
      teamMembers = await this.organizationMembershipRepository.count({
        where: { organizationId: userMembership.organizationId, status: MembershipStatus.ACTIVE },
      });

      const prioritizedBilling = await this.getPrioritizedBilling(
        userMembership.organizationId,
      );
      currentAmountDue = prioritizedBilling.totalAmount;
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
      currentAmountDue,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      teamMembers,
      ordersThisWeek,
      pendingPayments,
      completedPayments,
      billingAndPaymentsThisMonth,
      ordersByStatus,
      recentActivity,
      monthlyOrderVolume,
      averageOrderValue,
      deliverySuccessRate,
    };
  }

  async getBusinessReport(
    userId: UUID,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<BusinessReportData> {
    const now = new Date();
    const start = periodStart ? new Date(periodStart) : new Date(now);
    if (!periodStart) {
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);

    const end = periodEnd ? new Date(periodEnd) : new Date(now);
    end.setHours(23, 59, 59, 999);

    const orderCondition = '(order.senderId = :userId OR order.createdById = :userId)';

    const [totalOrders, completedDeliveries, pendingPayments, completedPayments] =
      await Promise.all([
        this.orderRepository
          .createQueryBuilder('order')
          .where(orderCondition, { userId })
          .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
          .getCount(),
        this.orderAssignmentRepository
          .createQueryBuilder('assignment')
          .innerJoin('assignment.order', 'order')
          .where(orderCondition, { userId })
          .andWhere('assignment.status = :status', {
            status: OrderAssignmentStatus.COMPLETED,
          })
          .andWhere('assignment.updatedAt BETWEEN :start AND :end', { start, end })
          .getCount(),
        this.paymentRepository.count({
          where: {
            createdById: userId,
            status: KpayPaymentStatus.PENDING,
          },
        }),
        this.paymentRepository.count({
          where: {
            createdById: userId,
            status: KpayPaymentStatus.SUCCESSFUL,
          },
        }),
      ]);

    const totalRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.createdById = :userId', { userId })
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .andWhere('payment.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');
    const completionRate =
      totalOrders > 0 ? Math.round((completedDeliveries / totalOrders) * 100) : 0;
    const averageOrderValue =
      completedDeliveries > 0
        ? Math.round((totalRevenue / completedDeliveries) * 100) / 100
        : 0;

    const deliveriesByDay = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.order', 'order')
      .select(`TO_CHAR(DATE_TRUNC('day', assignment.updatedAt), 'YYYY-MM-DD')`, 'label')
      .addSelect('COUNT(*)', 'value')
      .where(orderCondition, { userId })
      .andWhere('assignment.status = :status', { status: OrderAssignmentStatus.COMPLETED })
      .andWhere('assignment.updatedAt BETWEEN :start AND :end', { start, end })
      .groupBy(`DATE_TRUNC('day', assignment.updatedAt)`)
      .orderBy(`DATE_TRUNC('day', assignment.updatedAt)`, 'ASC')
      .getRawMany();

    const deliveriesByDayMap = new Map<string, number>(
      deliveriesByDay.map((row: { label: string; value: string }) => [
        row.label,
        parseInt(row.value, 10),
      ])
    );

    const deliveriesLineChart: ChartDataPoint[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const label = cursor.toISOString().slice(0, 10);
      deliveriesLineChart.push({
        label,
        value: deliveriesByDayMap.get(label) || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const statusRows = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.order', 'order')
      .select('assignment.status', 'status')
      .addSelect('COUNT(*)', 'value')
      .where(orderCondition, { userId })
      .andWhere('assignment.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('assignment.status')
      .getRawMany();

    const assignmentStatusPie: BusinessReportPieSlice[] = statusRows.map(
      (row: { status: string; value: string }, index: number) => ({
        label: row.status,
        value: parseInt(row.value, 10),
        color: REPORT_PIE_COLORS[index % REPORT_PIE_COLORS.length],
      })
    );

    const deliveriesRows = await this.orderAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.order', 'order')
      .leftJoin('assignment.assignedTo', 'rider')
      .select('order.referenceId', 'referenceId')
      .addSelect('COALESCE(rider.name, :fallbackRider)', 'riderName')
      .addSelect('assignment.updatedAt', 'completedAt')
      .addSelect('COALESCE(order.finalFee, 0)', 'amount')
      .addSelect('assignment.status', 'status')
      .where(orderCondition, { userId })
      .andWhere('assignment.status = :status', { status: OrderAssignmentStatus.COMPLETED })
      .andWhere('assignment.updatedAt BETWEEN :start AND :end', { start, end })
      .setParameter('fallbackRider', 'Unassigned')
      .orderBy('assignment.updatedAt', 'DESC')
      .limit(20)
      .getRawMany();

    const membership = await this.organizationMembershipRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: { organization: true },
    });

    const currentBilling = membership
      ? await this.getPrioritizedBilling(membership.organizationId)
      : { breakdown: [], totalAmount: 0, planName: undefined };

    return {
      organizationName: membership?.organization?.name,
      generatedAt: new Date(),
      periodStart: start,
      periodEnd: end,
      summary: {
        totalOrders,
        completedDeliveries,
        completionRate,
        totalRevenue,
        pendingPayments,
        completedPayments,
        averageOrderValue,
      },
      deliveriesLineChart,
      assignmentStatusPie,
      deliveriesTable: deliveriesRows.map(
        (row: {
          referenceId: string;
          riderName: string;
          completedAt: string;
          amount: string;
          status: OrderAssignmentStatus;
        }) => ({
          referenceId: row.referenceId,
          riderName: row.riderName,
          completedAt: new Date(row.completedAt),
          amount: Number(row.amount || 0),
          status: row.status,
        })
      ),
      currentBillingBreakdown: currentBilling.breakdown,
      currentBillingPlanName: currentBilling.planName,
    };
  }

  buildBusinessReportHtml(report: BusinessReportData): string {
    const supportEmail = process.env.PEEKABOO_SUPPORT_EMAIL || 'info@peekaboo.co.rw';
    const supportPhone = process.env.PEEKABOO_SUPPORT_PHONE || '+250 788 000 000';
    const lineChartSvg = buildLineChartSvg(report.deliveriesLineChart);
    const pieChartSvg = buildPieChartSvg(report.assignmentStatusPie);

    const pieLegend = report.assignmentStatusPie.length
      ? report.assignmentStatusPie
          .map(
            (item) =>
              `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#334155;"><span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${item.color};"></span>${escapeHtml(item.label)} (${item.value})</div>`
          )
          .join('')
      : '<div style="font-size:12px;color:#64748b;">No status records in selected period</div>';

    const deliveriesTableRows = report.deliveriesTable.length
      ? report.deliveriesTable
          .map(
            (row) => `<tr>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row.referenceId)}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row.riderName)}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${new Date(row.completedAt).toLocaleString()}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">RWF ${row.amount.toLocaleString()}</td>
          </tr>`
          )
          .join('')
      : '<tr><td colspan="4" style="padding:10px;color:#64748b;">No completed deliveries in this period</td></tr>';

    const billingBreakdownRows = report.currentBillingBreakdown?.length
      ? report.currentBillingBreakdown
          .map(
            (row) => `<tr>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row.tierLabel)}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${row.quantity}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">RWF ${row.unitPrice.toLocaleString()}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">RWF ${row.subtotal.toLocaleString()}</td>
          </tr>`
          )
          .join('')
      : '<tr><td colspan="4" style="padding:10px;color:#64748b;">No current billing breakdown available</td></tr>';

    return `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Peekaboo Business Report</title>
      </head>
      <body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px;">
        <main style="max-width:980px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <header style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;">
            <div>
              <h1 style="margin:0 0 8px;font-size:26px;">Business Performance Report</h1>
              <p style="margin:0;color:#475569;">${escapeHtml(report.organizationName || 'Business Account')} | ${new Date(report.periodStart).toDateString()} to ${new Date(report.periodEnd).toDateString()}</p>
            </div>
            <div style="font-size:12px;color:#64748b;">Generated: ${new Date(report.generatedAt).toLocaleString()}</div>
          </header>

          <section style="margin-top:22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
            <article style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:12px;color:#64748b;">Total Orders</div><div style="font-size:24px;font-weight:700;">${report.summary.totalOrders}</div></article>
            <article style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:12px;color:#64748b;">Completed Deliveries</div><div style="font-size:24px;font-weight:700;">${report.summary.completedDeliveries}</div></article>
            <article style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:12px;color:#64748b;">Completion Rate</div><div style="font-size:24px;font-weight:700;">${report.summary.completionRate}%</div></article>
            <article style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:12px;color:#64748b;">Total Revenue</div><div style="font-size:24px;font-weight:700;">RWF ${report.summary.totalRevenue.toLocaleString()}</div></article>
            <article style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:12px;color:#64748b;">Pending Payments</div><div style="font-size:24px;font-weight:700;">${report.summary.pendingPayments}</div></article>
            <article style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:12px;color:#64748b;">Avg Order Value</div><div style="font-size:24px;font-weight:700;">RWF ${report.summary.averageOrderValue.toLocaleString()}</div></article>
          </section>

          <section style="margin-top:26px;">
            <h2 style="margin:0 0 10px;font-size:18px;">Deliveries Trend (Graph)</h2>
            ${lineChartSvg}
          </section>

          <section style="margin-top:26px;display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:center;">
            <div>
              <h2 style="margin:0 0 8px;font-size:18px;">Assignment Mix (Pie Chart)</h2>
              ${pieChartSvg}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${pieLegend}
            </div>
          </section>

          <section style="margin-top:26px;">
            <h2 style="margin:0 0 10px;font-size:18px;">Completed Deliveries Table</h2>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#f1f5f9;text-align:left;">
                  <th style="padding:10px;font-size:12px;">Order Ref</th>
                  <th style="padding:10px;font-size:12px;">Rider</th>
                  <th style="padding:10px;font-size:12px;">Completed At</th>
                  <th style="padding:10px;font-size:12px;">Amount</th>
                </tr>
              </thead>
              <tbody>${deliveriesTableRows}</tbody>
            </table>
          </section>

          <section style="margin-top:26px;">
            <h2 style="margin:0 0 10px;font-size:18px;">Current Billing Breakdown${report.currentBillingPlanName ? ` - ${escapeHtml(report.currentBillingPlanName)}` : ''}</h2>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#f1f5f9;text-align:left;">
                  <th style="padding:10px;font-size:12px;">Tier</th>
                  <th style="padding:10px;font-size:12px;text-align:right;">Deliveries</th>
                  <th style="padding:10px;font-size:12px;text-align:right;">Unit Price</th>
                  <th style="padding:10px;font-size:12px;text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${billingBreakdownRows}</tbody>
            </table>
          </section>

          <footer style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:14px;color:#475569;font-size:12px;">
            <div><strong>Provided by Peekaboo.</strong></div>
            <div>Any enquiry: ${escapeHtml(supportPhone)} | ${escapeHtml(supportEmail)}</div>
          </footer>
        </main>
      </body>
      </html>
    `;
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
    const billingAndPaymentsThisMonthResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .andWhere('payment.createdAt >= DATE_TRUNC(\'month\', CURRENT_DATE)')
      .getRawOne();

    return {
      totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
      billingAndPaymentsThisMonth: parseFloat(
        billingAndPaymentsThisMonthResult?.total || '0'
      ),
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
