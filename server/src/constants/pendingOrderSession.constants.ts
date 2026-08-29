export enum PendingOrderSessionStatus {
  AWAITING_RECIPIENT = "awaiting_recipient",
  AWAITING_PICKUP_LOCATION = "awaiting_pickup_location",
  AWAITING_RECIPIENT_INVITATION = "awaiting_recipient_invitation",
  AWAITING_DROPOFF_LOCATION = "awaiting_dropoff_location",
  AWAITING_QUOTE_CONFIRMATION = "awaiting_quote_confirmation",
  PAYMENT_PENDING = "payment_pending",
  PAID = "paid",
  DECLINED = "declined",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}
