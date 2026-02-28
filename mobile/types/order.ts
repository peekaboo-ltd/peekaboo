import { User } from './auth';

export enum OrderType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  ACTIVE = 'ACTIVE',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrderActivity {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  referenceId: string;
  trackingId?: string;
  recipientId?: string;
  senderId?: string;
  createdById: string;
  status?: OrderStatus;
  initialFee: number;
  type: OrderType;
  discount: number;
  finalFee?: number;
  conversationId?: string;
  locationFrom?: Location;
  locationTo?: Location;
  recipient?: User;
  sender?: User;
  createdBy?: User;
  activities?: OrderActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderUpdateParams {
  status?: OrderStatus;
}
