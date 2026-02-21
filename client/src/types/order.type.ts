import { type UUID } from '../types';
import { type BaseDomain } from './base';
import { OrderActivity } from './orderActivity.type';
import type { User } from './user.type';
import type { OrderAssignment } from './orderAssignment.type';

export const OrderType = {
  SEND: 'SEND',
  RECEIVE: 'RECEIVE',
};

export enum OrderStatus {
  DRAFT = 'DRAFT',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrderLocation {
  latitude: number | null;
  longitude: number | null;
  address?: string;
}

export interface Order extends BaseDomain {
  referenceId: string;
  status: OrderStatus;
  trackingId?: string | null;
  recipientId?: UUID | null;
  senderId?: UUID | null;
  createdById: UUID;
  initialFee: number;
  type: keyof typeof OrderType;
  discount?: number | null;
  finalFee?: number | null;
  conversationId?: UUID | null;
  locationFrom?: OrderLocation | null;
  locationTo?: OrderLocation | null;
  senderName?: string;
  senderPhoneNumber?: string;
  recipientName?: string;
  recipientPhoneNumber?: string;
  notes?: string;
  description?: string;
  batchId?: UUID | null;
  externalReferenceId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  recipient?: User;
  createdBy?: User;
  sender?: User;
  activities?: OrderActivity[];
  assignments?: OrderAssignment[];
}
