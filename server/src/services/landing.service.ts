import { AppDataSource } from '../data-source';
import { RoleTypes } from '../constants/role.constants';
import { UserStatus } from '../constants/user.constants';
import { OrderStatus } from '../constants/order.constants';
import { UserRole } from '../entities/userRole.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { User } from '../entities/user.entity';
import { getRiderLocation, sortRidersByProximity } from '../helpers/distance.helper';
import {
  Coordinates,
  SuggestedRiderPosition,
  toSuggestedRiderPosition,
} from '../helpers/riderSuggestion.helper';
import { UserService } from './user.service';

export interface LandingStats {
  activeCustomers: number;
  customersWithOrders: number;
  orderStatus: OrderStatus;
}

const RIDER_CACHE_TTL_MS = 30 * 1000;
let riderCache: { riders: User[]; expiresAt: number } | null = null;
let riderCacheMiss: Promise<User[]> | null = null;

export class LandingService {
  private userRoleRepository = AppDataSource.getRepository(UserRole);
  private orderActivityRepository = AppDataSource.getRepository(OrderActivity);
  private userService = new UserService();

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

  async getSuggestedRider(
    pickup: Coordinates
  ): Promise<SuggestedRiderPosition | null> {
    const riders = await this.getCachedActiveRiders();
    const locatable = riders.filter((rider) => getRiderLocation(rider) !== null);
    if (!locatable.length) return null;

    const [suggestedRider] = sortRidersByProximity(locatable, pickup);
    return toSuggestedRiderPosition(suggestedRider, pickup);
  }

  private async getCachedActiveRiders(): Promise<User[]> {
    const now = Date.now();
    if (riderCache && riderCache.expiresAt > now) return riderCache.riders;
    if (riderCacheMiss) return riderCacheMiss;

    // Per-process cache: bounds database reads without caller-controlled cache keys.
    // That bounded cost is deliberate; this endpoint does not introduce the app's first limiter.
    riderCacheMiss = this.userService
      .fetchUsers({
        page: 0,
        size: 100,
        condition: {
          userRoles: { role: { name: RoleTypes.RIDER } },
          status: UserStatus.ACTIVE,
        },
        relations: ['userRoles.role', 'assignments'],
      })
      .then(({ rows }) => {
        riderCache = {
          riders: rows,
          expiresAt: Date.now() + RIDER_CACHE_TTL_MS,
        };
        return rows;
      })
      .finally(() => {
        riderCacheMiss = null;
      });

    return riderCacheMiss;
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
