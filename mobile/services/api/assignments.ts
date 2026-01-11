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
 * API response structure for paginated endpoints
 */
interface ApiPaginatedResponse<T> {
  message: string;
  data: {
    rows: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * API response structure for single assignment endpoint
 */
interface AssignmentApiResponse {
  message: string;
  data: Assignment;
}

/**
 * Assignments API endpoints
 */
export const assignmentsAPI = {
  /**
   * Get all assignments for current rider
   */
  getAll: async (params?: AssignmentListParams): Promise<PaginatedResponse<Assignment>> => {
    const response = await apiClient.get<ApiPaginatedResponse<Assignment>>('/order-assignments', { params });
    // Transform API response to expected format
    const apiData = response.data.data;
    return {
      data: apiData.rows,
      total: apiData.totalCount,
      page: apiData.currentPage,
      limit: params?.limit || 20,
      totalPages: apiData.totalPages,
    };
  },

  /**
   * Get assignment by ID
   */
  getById: async (id: string): Promise<Assignment> => {
    const response = await apiClient.get<AssignmentApiResponse>(`/order-assignments/${id}`);
    // Extract assignment from nested response structure
    return response.data.data;
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
    const response = await apiClient.get<ApiPaginatedResponse<Assignment>>('/order-assignments', { 
      params: { status: 'PENDING' } 
    });
    return response.data.data.rows;
  },

  /**
   * Get active assignments
   */
  getActive: async (): Promise<Assignment[]> => {
    const response = await apiClient.get<ApiPaginatedResponse<Assignment>>('/order-assignments', { 
      params: { status: 'ACTIVE' } 
    });
    return response.data.data.rows;
  },
};
