import { AppDataSource } from '../data-source';
import { RoleTypes } from '../constants/role.constants';
import { UserStatus } from '../constants/user.constants';
import { OrderStatus } from '../constants/order.constants';
import { UserRole } from '../entities/userRole.entity';
import { OrderActivity } from '../entities/orderActivity.entity';

export interface LandingStats {
  activeCustomers: number;
  customersWithOrders: number;
  orderStatus: OrderStatus;
}

export class LandingService {
  private userRoleRepository = AppDataSource.getRepository(UserRole);
  private orderActivityRepository = AppDataSource.getRepository(OrderActivity);

  async getLandingStats(orderStatus: OrderStatus = OrderStatus.COMPLETED): Promise<LandingStats> {
    const [activeCustomers, customersWithOrders] = await Promise.all([
      this.getActiveCustomersCount(),
      this.getCustomersWithOrdersCount(orderStatus),
    ]);

    return {
      activeCustomers,
      customersWithOrders,
      orderStatus,
    };
  }

  private async getActiveCustomersCount(): Promise<number> {
    return await this.userRoleRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role')
      .innerJoin('userRole.user', 'user')
      .where('role.name = :roleName', { roleName: RoleTypes.CUSTOMER })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount();
  }

  /**
   * Count distinct customer users that have at least one order whose latest activity
   * matches the provided status.
   */
  private async getCustomersWithOrdersCount(orderStatus: OrderStatus): Promise<number> {
    const result = await this.orderActivityRepository
      .createQueryBuilder('activity')
      .innerJoin('activity.order', 'order')
      .innerJoin('order.createdBy', 'user')
      .innerJoin('user.userRoles', 'userRole')
      .innerJoin('userRole.role', 'role')
      .select('COUNT(DISTINCT order.createdById)', 'count')
      .where('role.name = :roleName', { roleName: RoleTypes.CUSTOMER })
      .andWhere('activity.status = :status', { status: orderStatus })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(sub.createdAt)')
          .from(OrderActivity, 'sub')
          .where('sub.orderId = activity.orderId')
          .getQuery();
        return 'activity.createdAt = ' + subQuery;
      })
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }
}

