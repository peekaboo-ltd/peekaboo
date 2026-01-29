import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Organization } from '../entities/organization.entity';
import { Order } from '../entities/order.entity';
import { OrganizationMembership } from '../entities/organizationMembership.entity';
import { UUID } from '../types';
import { NotFoundError } from '../helpers/errors.helper';
import { OrderStatus } from '../constants/order.constants';
import { MembershipStatus } from '../constants/organization.constants';

export class OrganizationDashboardService {
  private readonly organizationRepository: Repository<Organization>;
  private readonly orderRepository: Repository<Order>;
  private readonly membershipRepository: Repository<OrganizationMembership>;

  constructor() {
    this.organizationRepository = AppDataSource.getRepository(Organization);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.membershipRepository = AppDataSource.getRepository(OrganizationMembership);
  }

  // GET ORGANIZATION DASHBOARD METRICS
  async getOrganizationDashboardMetrics(organizationId: UUID): Promise<{
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    pendingBilling: number;
    totalMembers: number;
    ordersByStatus: Array<{ status: string; count: number }>;
    monthlyOrderVolume: Array<{ month: string; count: number; amount: number }>;
    recentActivity: Order[];
    topMembers: Array<{ user: any; orderCount: number; totalSpent: number }>;
  }> {
    // Verify organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    // Get all orders for the organization
    const orders = await this.orderRepository.find({
      where: { organizationId },
      relations: {
        activities: true,
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate basic metrics
    const totalOrders = orders.length;
    let activeOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let totalSpent = 0;

    const ordersByStatus: Map<string, number> = new Map();

    for (const order of orders) {
      const latestActivity = order.activities?.[0];
      const status = latestActivity?.status || OrderStatus.CREATED;

      // Count by status
      ordersByStatus.set(status, (ordersByStatus.get(status) || 0) + 1);

      // Categorize orders
      if (
        status === OrderStatus.COMPLETED ||
        status === OrderStatus.DELIVERED
      ) {
        completedOrders++;
      } else if (status === OrderStatus.CANCELLED) {
        cancelledOrders++;
      } else {
        activeOrders++;
      }

      // Calculate total spent
      totalSpent += Number(order.finalFee || order.initialFee || 0);
    }

    // Get pending billing (orders not yet in a paid billing period)
    const pendingOrders = await this.orderRepository.find({
      where: { organizationId },
      relations: { organizationBilling: true },
    });

    let pendingBilling = 0;
    for (const order of pendingOrders) {
      if (
        !order.organizationBilling ||
        order.organizationBilling.status === 'PENDING'
      ) {
        pendingBilling += Number(order.finalFee || order.initialFee || 0);
      }
    }

    // Get total active members
    const totalMembers = await this.membershipRepository.count({
      where: {
        organizationId,
        status: MembershipStatus.ACTIVE,
      },
    });

    // Orders by status array
    const ordersByStatusArray = Array.from(ordersByStatus.entries()).map(
      ([status, count]) => ({ status, count })
    );

    // Monthly order volume (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData: Map<
      string,
      { count: number; amount: number }
    > = new Map();

    for (const order of orders) {
      if (order.createdAt >= sixMonthsAgo) {
        const monthKey = `${order.createdAt.getFullYear()}-${String(
          order.createdAt.getMonth() + 1
        ).padStart(2, '0')}`;
        const current = monthlyData.get(monthKey) || { count: 0, amount: 0 };
        current.count++;
        current.amount += Number(order.finalFee || order.initialFee || 0);
        monthlyData.set(monthKey, current);
      }
    }

    const monthlyOrderVolume = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Recent activity (last 10 orders)
    const recentActivity = orders.slice(0, 10);

    // Top members (top 5 by order count)
    const memberOrderCounts: Map<
      string,
      { user: any; orderCount: number; totalSpent: number }
    > = new Map();

    for (const order of orders) {
      if (order.createdBy) {
        const userId = order.createdBy.id;
        const current = memberOrderCounts.get(userId) || {
          user: order.createdBy,
          orderCount: 0,
          totalSpent: 0,
        };
        current.orderCount++;
        current.totalSpent += Number(order.finalFee || order.initialFee || 0);
        memberOrderCounts.set(userId, current);
      }
    }

    const topMembers = Array.from(memberOrderCounts.values())
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalSpent,
      pendingBilling,
      totalMembers,
      ordersByStatus: ordersByStatusArray,
      monthlyOrderVolume,
      recentActivity,
      topMembers,
    };
  }
}
