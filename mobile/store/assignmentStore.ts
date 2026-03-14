import { create } from 'zustand';
import { Assignment, OrderAssignmentStatus, OrderStatus } from '../types';
import { assignmentsAPI } from '../services/api/assignments';
import { handleAPIError, getErrorMessage } from '../utils/errorHandler';
import { useAuthStore } from './authStore';

const withCurrentRider = <T extends Record<string, unknown>>(params: T): T => {
  const currentUserId = useAuthStore.getState().user?.id;
  if (!currentUserId) {
    return params;
  }

  return {
    ...params,
    assignedToId: currentUserId,
  };
};

interface AssignmentState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  filter: OrderAssignmentStatus | 'ALL';
  
  // Pagination
  page: number;
  totalPages: number;
  hasMore: boolean;
  
  // Actions
  fetchAssignments: (filter?: OrderAssignmentStatus | 'ALL') => Promise<void>;
  fetchMoreAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<Assignment | null>;
  acceptAssignment: (id: string) => Promise<boolean>;
  rejectAssignment: (id: string, reason?: string) => Promise<boolean>;
  confirmOrderDispatch: (orderId: string, trackingId?: string) => Promise<boolean>;
  completeOrder: (orderId: string, trackingId: string) => Promise<boolean>;
  refreshAssignments: () => Promise<void>;
  setFilter: (filter: OrderAssignmentStatus | 'ALL') => void;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  clearError: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  selectedAssignment: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  filter: OrderAssignmentStatus.PENDING,
  page: 1,
  totalPages: 1,
  hasMore: false,

  fetchAssignments: async (filter?: OrderAssignmentStatus | 'ALL'): Promise<void> => {
    const currentFilter = filter ?? get().filter;
    set({ isLoading: true, error: null, filter: currentFilter, page: 1 });
    
    try {
      const params = withCurrentRider(
        currentFilter !== 'ALL'
          ? { status: currentFilter, page: 1, size: 20 }
          : { page: 1, size: 20 },
      );
      
      const response = await assignmentsAPI.getAll(params);
      
      set({
        assignments: Array.isArray(response.data) ? response.data : [],
        totalPages: response.totalPages,
        hasMore: response.page < response.totalPages,
        isLoading: false,
      });
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
    }
  },

  fetchMoreAssignments: async (): Promise<void> => {
    const { page, hasMore, filter, isLoading } = get();
    
    if (!hasMore || isLoading) return;
    
    set({ isLoading: true });
    
    try {
      const nextPage = page + 1;
      const params = withCurrentRider(
        filter !== 'ALL'
          ? { status: filter, page: nextPage, size: 20 }
          : { page: nextPage, size: 20 },
      );
      
      const response = await assignmentsAPI.getAll(params);
      
      const newAssignments = Array.isArray(response.data) ? response.data : [];
      set(state => ({
        assignments: [...state.assignments, ...newAssignments],
        page: nextPage,
        hasMore: nextPage < response.totalPages,
        isLoading: false,
      }));
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
    }
  },

  fetchAssignmentById: async (id: string): Promise<Assignment | null> => {
    set({ isLoading: true, error: null });
    
    try {
      const assignment = await assignmentsAPI.getById(id);
      set({
        selectedAssignment: assignment,
        isLoading: false,
      });
      return assignment;
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
      return null;
    }
  },

  acceptAssignment: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const updatedAssignment = await assignmentsAPI.accept(id);

      // Update assignment in list with server response data
      set(state => ({
        assignments: state.assignments.map(a =>
          a.id === id ? { ...a, ...updatedAssignment } : a
        ),
        selectedAssignment: state.selectedAssignment?.id === id
          ? { ...state.selectedAssignment, ...updatedAssignment }
          : state.selectedAssignment,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
      return false;
    }
  },

  rejectAssignment: async (id: string, reason?: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      await assignmentsAPI.reject(id, reason);

      // Update rejected assignment in list and remove from pending view
      set(state => ({
        assignments: state.assignments.map(a =>
          a.id === id ? { ...a, status: OrderAssignmentStatus.REJECTED } : a
        ),
        selectedAssignment: state.selectedAssignment?.id === id
          ? { ...state.selectedAssignment, status: OrderAssignmentStatus.REJECTED }
          : state.selectedAssignment,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
      return false;
    }
  },



  confirmOrderDispatch: async (orderId: string, trackingId?: string): Promise<boolean> => {
    set({ error: null });

    try {
      await assignmentsAPI.confirmOrderDispatch(orderId, trackingId);

      set(state => {
        const updateOrderInTransit = (order: { status?: OrderStatus } | undefined) =>
          order ? { ...order, status: OrderStatus.IN_TRANSIT } : undefined;
        return {
          assignments: state.assignments.map(a =>
            a.orderId === orderId
              ? { ...a, order: updateOrderInTransit(a.order) }
              : a,
          ),
          selectedAssignment: state.selectedAssignment
            ? {
                ...state.selectedAssignment,
                order: state.selectedAssignment.order
                  ? { ...state.selectedAssignment.order, status: OrderStatus.IN_TRANSIT }
                  : state.selectedAssignment.order,
              }
            : state.selectedAssignment,
        };
      });

      return true;
    } catch (error) {
      const appError = handleAPIError(error);
      set({ error: getErrorMessage(appError) });
      return false;
    }
  },

  completeOrder: async (orderId: string, trackingId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      await assignmentsAPI.completeOrder(orderId, trackingId);

      set(state => ({
        selectedAssignment: state.selectedAssignment
          ? {
              ...state.selectedAssignment,
              status: OrderAssignmentStatus.COMPLETED,
              order: state.selectedAssignment.order
                ? { ...state.selectedAssignment.order, status: OrderStatus.COMPLETED }
                : state.selectedAssignment.order,
            }
          : state.selectedAssignment,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
      return false;
    }
  },

  refreshAssignments: async (): Promise<void> => {
    set({ isRefreshing: true });
    
    try {
      const { filter } = get();
      const params = withCurrentRider(
        filter !== 'ALL'
          ? { status: filter, page: 1, size: 20 }
          : { page: 1, size: 20 },
      );
      
      const response = await assignmentsAPI.getAll(params);
      
      set({
        assignments: Array.isArray(response.data) ? response.data : [],
        page: 1,
        totalPages: response.totalPages,
        hasMore: response.page < response.totalPages,
        isRefreshing: false,
      });
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isRefreshing: false,
        error: getErrorMessage(appError),
      });
    }
  },

  setFilter: (filter: OrderAssignmentStatus | 'ALL'): void => {
    set({ filter });
    get().fetchAssignments(filter);
  },

  setSelectedAssignment: (assignment: Assignment | null): void => {
    set({ selectedAssignment: assignment });
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
