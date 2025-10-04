import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { OrderStatus } from '../../types/order.type';
import { OrderStatusBadge } from './OrderStatusBadge';

interface UpdateStatusDropdownProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

// Define allowed status transitions
const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

const statusDescriptions: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'Order has been created',
  [OrderStatus.PENDING]: 'Awaiting confirmation',
  [OrderStatus.CONFIRMED]: 'Order confirmed, awaiting payment',
  [OrderStatus.PAID]: 'Payment received, ready for assignment',
  [OrderStatus.ACCEPTED]: 'Rider accepted the order',
  [OrderStatus.IN_TRANSIT]: 'Order is on the way',
  [OrderStatus.DELIVERED]: 'Order delivered to recipient',
  [OrderStatus.COMPLETED]: 'Order completed successfully',
  [OrderStatus.CANCELLED]: 'Order has been cancelled',
};

export const UpdateStatusDropdown: React.FC<UpdateStatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const allowedTransitions = statusTransitions[currentStatus] || [];

  if (allowedTransitions.length === 0) {
    return (
      <Button variant="outline" disabled>
        Status: <OrderStatusBadge status={currentStatus} className="ml-2" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          Update Status
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Current Status</span>
            <OrderStatusBadge status={currentStatus} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Available Transitions
        </DropdownMenuLabel>
        {allowedTransitions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => onStatusChange(status)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {statusDescriptions[status]}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};