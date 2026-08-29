export enum OrderType {
  SEND = "SEND",
  RECEIVE = "RECEIVE",
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  CREATED = "CREATED",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  ACCEPTED = "ACCEPTED",
  PAID = "PAID",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  BILLING_PAID = "BILLING_PAID",
}

export enum OrderActivityStatus {
  DRAFT = "DRAFT",
  CREATED = "CREATED",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  ACCEPTED = "ACCEPTED",
  PAID = "PAID",
  PAYMENT_DEFERRED = "PAYMENT_DEFERRED",
  ACTIVE = "ACTIVE",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  BILLING_PAID = "BILLING_PAID",
}

export enum OrderPaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export enum OrderPayerType {
  SENDER = "SENDER",
  RECIPIENT = "RECIPIENT",
}

// How the sender wants Peekaboo to reach them about this delivery. Deliberately
// separate from MessageChannel, which describes the transport an existing
// conversation message arrived on and backs a non-nullable column on `messages`.
export enum PreferredContactMethod {
  WHATSAPP = "WHATSAPP",
  PHONE = "PHONE",
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export enum OrderAssignmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

const PAID_EQUIVALENT_ACTIVITY_STATUSES = new Set<OrderActivityStatus>([
  OrderActivityStatus.PAID,
  OrderActivityStatus.PAYMENT_DEFERRED,
]);

const NON_LIFECYCLE_ACTIVITY_STATUSES = new Set<OrderActivityStatus>([
  OrderActivityStatus.BILLING_PAID,
  OrderActivityStatus.PAYMENT_DEFERRED,
]);

export const isPaidEquivalentOrderActivityStatus = (
  status?: string | null
): status is OrderActivityStatus.PAID | OrderActivityStatus.PAYMENT_DEFERRED =>
  !!status && PAID_EQUIVALENT_ACTIVITY_STATUSES.has(status as OrderActivityStatus);

export const isLifecycleOrderActivityStatus = (
  status?: string | null
): status is OrderStatus =>
  !!status &&
  Object.values(OrderStatus).includes(status as OrderStatus) &&
  !NON_LIFECYCLE_ACTIVITY_STATUSES.has(status as OrderActivityStatus);
