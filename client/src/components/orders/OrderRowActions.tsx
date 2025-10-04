import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  FileText, 
  Trash,
  XCircle
} from 'lucide-react';
import type { Order } from '../../types/order.type';
import { OrderStatus } from '../../types/order.type';

interface OrderRowActionsProps {
  order: Order;
  onUpdateStatus?: (status: OrderStatus) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

export const OrderRowActions: React.FC<OrderRowActionsProps> = ({ 
  order,
  onUpdateStatus,
  onDelete,
  onCancel
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/admin/orders/${order.id}`);
  };

  const handleEdit = () => {
    navigate(`/admin/orders/${order.id}/edit`);
  };

  const canCancel = [
    OrderStatus.CREATED,
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PAID
  ].includes(order.status);

  const canDelete = order.status === OrderStatus.CANCELLED;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Order
        </DropdownMenuItem>
        
        {onUpdateStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            {order.status === OrderStatus.CREATED && (
              <DropdownMenuItem onClick={() => onUpdateStatus(OrderStatus.PENDING)}>
                <FileText className="mr-2 h-4 w-4" />
                Mark as Pending
              </DropdownMenuItem>
            )}
            {order.status === OrderStatus.PENDING && (
              <DropdownMenuItem onClick={() => onUpdateStatus(OrderStatus.CONFIRMED)}>
                <FileText className="mr-2 h-4 w-4" />
                Confirm Order
              </DropdownMenuItem>
            )}
            {order.status === OrderStatus.CONFIRMED && (
              <DropdownMenuItem onClick={() => onUpdateStatus(OrderStatus.PAID)}>
                <FileText className="mr-2 h-4 w-4" />
                Mark as Paid
              </DropdownMenuItem>
            )}
            {order.status === OrderStatus.IN_TRANSIT && (
              <DropdownMenuItem onClick={() => onUpdateStatus(OrderStatus.DELIVERED)}>
                <FileText className="mr-2 h-4 w-4" />
                Mark as Delivered
              </DropdownMenuItem>
            )}
            {order.status === OrderStatus.DELIVERED && (
              <DropdownMenuItem onClick={() => onUpdateStatus(OrderStatus.COMPLETED)}>
                <FileText className="mr-2 h-4 w-4" />
                Complete Order
              </DropdownMenuItem>
            )}
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {canCancel && onCancel && (
          <DropdownMenuItem 
            onClick={onCancel}
            className="text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Order
          </DropdownMenuItem>
        )}
        
        {canDelete && onDelete && (
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Order
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};