import { User } from './auth';

export enum OrderType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  PAID = 'PAID',
  ACTIVE = 'ACTIVE',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  referenceId: string;
  recipientId?: string;
  senderId?: string;
  createdById: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface OrderUpdateParams {
  status?: OrderStatus;
}
