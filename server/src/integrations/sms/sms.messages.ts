export function buildPublicOrderSenderSMS({
  orderReference,
  trackingId,
}: {
  orderReference: string;
  trackingId: string;
}): string {
  return `Peekaboo order ${orderReference} has been created successfully. Your tracking code is ${trackingId}. Keep it safe for delivery completion.`;
}

export function buildPublicOrderRecipientSMS({
  orderReference,
  trackingId,
}: {
  orderReference: string;
  trackingId: string;
}): string {
  return `Peekaboo order ${orderReference} is being prepared for you. Share tracking code ${trackingId} with the rider only when your delivery is complete.`;
}

export function buildOrderCompletedSMS({
  orderReference,
}: {
  orderReference: string;
}): string {
  return `Peekaboo order ${orderReference} has been completed successfully. Thank you for using Peekaboo.`;
}
