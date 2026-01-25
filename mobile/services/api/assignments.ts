import apiClient from './client';
import {
  Assignment,
  AssignmentListParams,
  AcceptAssignmentResponse,
  RejectAssignmentResponse,
  AssignmentApiResponse
} from '../../types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * API response structure for paginated endpoints
 * Matches server pagination helper response format
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
 * Convert client pagination params to server format
 * Server uses 0-based pagination, client uses 1-based
 */
const convertPaginationParams = (params?: AssignmentListParams) => {
  if (!params) return {};

  const serverParams: Record<string, unknown> = {};

  if (params.status) serverParams.status = params.status;
  if (params.orderId) serverParams.orderId = params.orderId;
  if (params.assignedToId) serverParams.assignedToId = params.assignedToId;

  // Convert 1-based page to 0-based for server
  if (params.page !== undefined) {
    serverParams.page = Math.max(0, params.page - 1);
  }

  // Server uses 'size', not 'limit'
  if (params.size !== undefined) {
    serverParams.size = params.size;
  }

  return serverParams;
};

/**
 * Assignments API endpoints
 * Aligned with server's orderAssignment.service.ts
 */
export const assignmentsAPI = {
  /**
   * Get all assignments for current rider
   * Supports filtering by: status, orderId, assignedToId
   * Pagination: page (1-based in client, converted to 0-based for server), size
   */
  getAll: async (params?: AssignmentListParams): Promise<PaginatedResponse<Assignment>> => {
    const serverParams = convertPaginationParams(params);
    const response = await apiClient.get<ApiPaginatedResponse<Assignment>>('/order-assignments', {
      params: serverParams
    });
    // Transform API response to expected format
    const apiData = response.data.data;
    return {
      data: apiData.rows,
      total: apiData.totalCount,
      page: apiData.currentPage, // Server returns 1-based currentPage
      size: params?.size || 10,
      totalPages: apiData.totalPages,
    };
  },

  /**
   * Get assignment by ID with full order details including activities
   */
  getById: async (id: string): Promise<Assignment> => {
    const response = await apiClient.get<AssignmentApiResponse>(`/order-assignments/${id}`);
    // Extract assignment from nested response structure
    return response.data.data;
  },

  /**
   * Accept an assignment
   * Sets status to ACTIVE and triggers order activity creation if order is PAID
   */
  accept: async (id: string): Promise<Assignment> => {
    const response = await apiClient.patch<AcceptAssignmentResponse>(`/order-assignments/${id}/accept`);
    return response.data.data;
  },

  /**
   * Reject an assignment
   * Sets status to REJECTED and auto-triggers reassignment to next available rider
   */
  reject: async (id: string, reason?: string): Promise<Assignment> => {
    const response = await apiClient.patch<RejectAssignmentResponse>(`/order-assignments/${id}/reject`, { reason });
    return response.data.data;
  },

  /**
   * Get pending assignments for current rider
   */
  getPending: async (params?: Omit<AssignmentListParams, 'status'>): Promise<Assignment[]> => {
    const serverParams = convertPaginationParams({ ...params, status: 'PENDING' as const });
    const response = await apiClient.get<ApiPaginatedResponse<Assignment>>('/order-assignments', {
      params: serverParams
    });
    return response.data.data.rows;
  },

  /**
   * Get active assignments for current rider
   */
  getActive: async (params?: Omit<AssignmentListParams, 'status'>): Promise<Assignment[]> => {
    const serverParams = convertPaginationParams({ ...params, status: 'ACTIVE' as const });
    const response = await apiClient.get<ApiPaginatedResponse<Assignment>>('/order-assignments', {
      params: serverParams
    });
    return response.data.data.rows;
  },

  /**
   * Get assignments for a specific order
   */
  getByOrderId: async (orderId: string, params?: Omit<AssignmentListParams, 'orderId'>): Promise<PaginatedResponse<Assignment>> => {
    return assignmentsAPI.getAll({ ...params, orderId });
  },

  /**
   * Get assignments for a specific rider
   */
  getByRiderId: async (assignedToId: string, params?: Omit<AssignmentListParams, 'assignedToId'>): Promise<PaginatedResponse<Assignment>> => {
    return assignmentsAPI.getAll({ ...params, assignedToId });
  },
};
