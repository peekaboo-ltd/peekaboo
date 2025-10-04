import { api } from '../api/axios';
import type { Order } from '../types/order.type';
import type { OrderStatus, OrderType } from '../constants/order.constants';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  type?: OrderType;
  search?: string;
  startDate?: string;
  endDate?: string;
  referenceId?: string;
  userId?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOrderData {
  type: OrderType;
  senderName: string;
  senderPhoneNumber: string;
  senderLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  recipientName: string;
  recipientPhoneNumber: string;
  recipientLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  initialFee?: number;
  notes?: string;
}

export interface UpdateOrderData {
  senderName?: string;
  senderPhoneNumber?: string;
  senderLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  recipientName?: string;
  recipientPhoneNumber?: string;
  recipientLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  finalFee?: number;
  discount?: number;
  notes?: string;
}

class OrderService {
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.referenceId) params.append('referenceId', filters.referenceId);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get<OrdersResponse>(`/orders?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post<Order>('/orders', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  async updateOrder(id: string, data: UpdateOrderData): Promise<Order> {
    try {
      const response = await api.patch<Order>(`/orders/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order');
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await api.patch<Order>(`/orders/${id}`, { order: { status } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await api.delete(`/orders/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete order');
    }
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }
}

export const orderService = new OrderService();
export default orderService;