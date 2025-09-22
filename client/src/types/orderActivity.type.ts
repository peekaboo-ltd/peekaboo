import type { BaseDomain, UUID } from './base';
import type { Order, OrderStatus } from './order.type';
import type { User } from './user.type';

export interface OrderActivity extends BaseDomain {
  orderId: UUID;
  status: OrderStatus;
  createdById: UUID;
  createdBy?: User;
  order?: Order;
}
