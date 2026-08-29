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

export enum OrderPaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

/** Mirrors the server's PreferredContactMethod (server/src/constants/order.constants.ts). */
export enum PreferredContactMethod {
  WHATSAPP = 'WHATSAPP',
  PHONE = 'PHONE',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export const PREFERRED_CONTACT_METHOD_LABELS: Record<
  PreferredContactMethod,
  string
> = {
  [PreferredContactMethod.WHATSAPP]: 'WhatsApp',
  [PreferredContactMethod.PHONE]: 'Call',
  [PreferredContactMethod.SMS]: 'SMS',
  [PreferredContactMethod.EMAIL]: 'Email',
};

/** EMAIL is the one method that needs an address the order does not already have. */
export const contactMethodNeedsEmail = (
  method?: PreferredContactMethod | null,
): boolean => method === PreferredContactMethod.EMAIL;

export interface OrderLocation {
  latitude: number | null;
  longitude: number | null;
  // Human friendly labels captured when the place was picked, e.g.
  // name: "Kacyiru Police Station", formattedAddress: "KG 7 Ave, Kigali, Rwanda"
  name?: string;
  formattedAddress?: string;
  placeId?: string;
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
  paymentStatus?: OrderPaymentStatus | null;
  preferredContactMethod?: PreferredContactMethod | null;
  contactEmail?: string | null;
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
  organizationId?: UUID | null;
  isBusinessOrder?: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  recipient?: User;
  createdBy?: User;
  sender?: User;
  activities?: OrderActivity[];
  assignments?: OrderAssignment[];
}
