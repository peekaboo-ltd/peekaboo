import apiClient from './client';
import { Order, OrderUpdateParams } from '../../types';

/**
 * Orders API endpoints
 */
export const ordersAPI = {
  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, params: OrderUpdateParams): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}`, params);
    return response.data;
  },
};
