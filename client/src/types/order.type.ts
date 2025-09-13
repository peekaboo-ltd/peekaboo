import { type UUID } from '../types';
import { type BaseDomain } from './base';
import type { User } from './user.types';

export const OrderType = {
  SEND: 'SEND',
  RECEIVE: 'RECEIVE',
};

export const OrderStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ACCEPTED: 'ACCEPTED',
  ACTIVE: 'ACTIVE',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export interface Order extends BaseDomain {
  referenceId: string;
  recipientId?: UUID | null;
  senderId?: UUID | null;
  createdById: UUID;
  initialFee: number;
  type: typeof OrderType;
  status: typeof OrderStatus;
  discount?: number | null;
  finalFee?: number | null;
  conversationId?: UUID | null;
  locationFrom?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  locationTo?: {
    latitude: number | null;
    longitude: number | null;
  } | null;

  // Relations
  recipient?: User;
  createdBy?: User;
  sender?: User;
}
