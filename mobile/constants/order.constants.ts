import { OrderStatus } from '../types/order';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Draft',
  [OrderStatus.CREATED]: 'Created',
  [OrderStatus.PENDING]: 'Pending payment',
  [OrderStatus.PAID]: 'Paid',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.ACCEPTED]: 'Accepted',
  [OrderStatus.ACTIVE]: 'Active',
  [OrderStatus.IN_TRANSIT]: 'In Transit',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

export const getOrderStatusLabel = (status: OrderStatus | undefined): string => {
  if (!status) return '—';
  return ORDER_STATUS_LABELS[status] ?? status;
};
