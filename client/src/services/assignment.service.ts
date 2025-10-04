import { api } from '../api/axios';
import type { OrderAssignment } from '../types/orderAssignment.type';
import type { User } from '../types/user.type';

export interface CreateAssignmentData {
  orderId: string;
  riderId: string;
  notes?: string;
}

export interface UpdateAssignmentData {
  status?: string;
  notes?: string;
}

export interface AvailableRidersResponse {
  data: User[];
  total: number;
}

class AssignmentService {
  async getAssignmentsByOrder(orderId: string): Promise<OrderAssignment[]> {
    try {
      const response = await api.get<OrderAssignment[]>(`/orders/${orderId}/assignments`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }

  async getAvailableRiders(): Promise<User[]> {
    try {
      const response = await api.get<AvailableRidersResponse>('/users', {
        params: {
          roles: 'RIDER',
          status: 'ACTIVE',
          available: true,
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available riders');
    }
  }

  async createAssignment(data: CreateAssignmentData): Promise<OrderAssignment> {
    try {
      const response = await api.post<OrderAssignment>('/assignments', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create assignment');
    }
  }

  async updateAssignment(id: string, data: UpdateAssignmentData): Promise<OrderAssignment> {
    try {
      const response = await api.patch<OrderAssignment>(`/assignments/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update assignment');
    }
  }

  async acceptAssignment(id: string): Promise<OrderAssignment> {
    try {
      const response = await api.post<OrderAssignment>(`/assignments/${id}/accept`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to accept assignment');
    }
  }

  async rejectAssignment(id: string, reason?: string): Promise<OrderAssignment> {
    try {
      const response = await api.post<OrderAssignment>(`/assignments/${id}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject assignment');
    }
  }

  async completeAssignment(id: string): Promise<OrderAssignment> {
    try {
      const response = await api.post<OrderAssignment>(`/assignments/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete assignment');
    }
  }
}

export const assignmentService = new AssignmentService();
export default assignmentService;