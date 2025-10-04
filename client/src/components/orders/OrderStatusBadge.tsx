import React from 'react';
import { Badge } from '../ui/badge';
import { OrderStatus } from '../../types/order.type';
import { cn } from '../../lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { 
  label: string; 
  className: string;
}> = {
  [OrderStatus.CREATED]: {
    label: 'Created',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  [OrderStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  [OrderStatus.PAID]: {
    label: 'Paid',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  [OrderStatus.ACCEPTED]: {
    label: 'Accepted',
    className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  },
  [OrderStatus.IN_TRANSIT]: {
    label: 'In Transit',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  [OrderStatus.DELIVERED]: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge 
      className={cn(config.className, className)}
      variant="secondary"
    >
      {config.label}
    </Badge>
  );
};