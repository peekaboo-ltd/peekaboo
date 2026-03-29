import type { BaseDomain, UUID } from './base';
import type { Order } from './order.type';
import type { User } from './user.type';

export enum OrderActivityStatus {
  DRAFT = 'DRAFT',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  PAID = 'PAID',
  PAYMENT_DEFERRED = 'PAYMENT_DEFERRED',
  ACTIVE = 'ACTIVE',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BILLING_PAID = 'BILLING_PAID',
}

export interface OrderActivity extends BaseDomain {
  orderId: UUID;
  status: OrderActivityStatus;
  createdById: UUID;
  createdBy?: User;
  order?: Order;
  notes?: string | null;
}
