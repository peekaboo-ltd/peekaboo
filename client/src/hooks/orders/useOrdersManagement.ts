import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import orderService, { OrderFilters, OrdersResponse } from '../../services/order.service';
import type { Order } from '../../types/order.type';
import type { OrderStatus } from '../../types/order.type';

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  pageCount: number;
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
  refetch: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export const useOrdersManagement = (initialFilters: OrderFilters = {}): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: OrdersResponse = await orderService.getOrders(filters);
      setOrders(response.data);
      setPageCount(response.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      await fetchOrders();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update order status';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      await fetchOrders();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete order';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    pageCount,
    filters,
    setFilters,
    refetch: fetchOrders,
    updateOrderStatus,
    deleteOrder,
  };
};