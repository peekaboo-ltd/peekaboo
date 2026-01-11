import apiClient from './client';
import { 
  Assignment, 
  AssignmentListParams, 
  AcceptAssignmentResponse, 
  RejectAssignmentResponse 
} from '../../types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Assignments API endpoints
 */
export const assignmentsAPI = {
  /**
   * Get all assignments for current rider
   */
  getAll: async (params?: AssignmentListParams): Promise<PaginatedResponse<Assignment>> => {
    const response = await apiClient.get<PaginatedResponse<Assignment>>('/order-assignments', { params });
    return response.data;
  },

  /**
   * Get assignment by ID
   */
  getById: async (id: string): Promise<Assignment> => {
    const response = await apiClient.get<Assignment>(`/order-assignments/${id}`);
    return response.data;
  },

  /**
   * Accept an assignment
   */
  accept: async (id: string): Promise<AcceptAssignmentResponse> => {
    const response = await apiClient.patch<AcceptAssignmentResponse>(`/order-assignments/${id}/accept`);
    return response.data;
  },

  /**
   * Reject an assignment
   */
  reject: async (id: string, reason?: string): Promise<RejectAssignmentResponse> => {
    const response = await apiClient.patch<RejectAssignmentResponse>(`/order-assignments/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Get pending assignments
   */
  getPending: async (): Promise<Assignment[]> => {
    const response = await apiClient.get<PaginatedResponse<Assignment>>('/order-assignments', { 
      params: { status: 'PENDING' } 
    });
    return response.data.data;
  },

  /**
   * Get active assignments
   */
  getActive: async (): Promise<Assignment[]> => {
    const response = await apiClient.get<PaginatedResponse<Assignment>>('/order-assignments', { 
      params: { status: 'ACTIVE' } 
    });
    return response.data.data;
  },
};
