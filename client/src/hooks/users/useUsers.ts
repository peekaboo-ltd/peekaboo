import { useState, useCallback, useEffect } from 'react';
import { userService, UserFilters } from '../../services/user.service';
import { User } from '../../types/user.type';
import { toast } from 'sonner';

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pageCount: number;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  refetch: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserStatus: (id: string, status: string) => Promise<void>;
}

export const useUsers = (initialFilters: UserFilters = {}): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    ...initialFilters
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers(filters);
      setUsers(response.data);
      setTotal(response.total);
      setPageCount(response.totalPages);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.deleteUser(id);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
      throw err;
    }
  }, [fetchUsers]);

  const updateUserStatus = useCallback(async (id: string, status: string) => {
    try {
      await userService.updateUserStatus(id, status as any);
      toast.success('User status updated successfully');
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
      throw err;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    total,
    pageCount,
    filters,
    setFilters,
    refetch: fetchUsers,
    deleteUser,
    updateUserStatus
  };
};

// Hook for single user
interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  userOrders: any[];
  userAssignments: any[];
  isLoadingOrders: boolean;
  isLoadingAssignments: boolean;
}

export const useUser = (userId: string): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch user');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUserOrders = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingOrders(true);
    
    try {
      const orders = await userService.getUserOrders(userId);
      setUserOrders(orders);
    } catch (err: any) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [userId]);

  const fetchUserAssignments = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingAssignments(true);
    
    try {
      const assignments = await userService.getUserAssignments(userId);
      setUserAssignments(assignments);
    } catch (err: any) {
      console.error('Failed to fetch user assignments:', err);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [userId]);

  const updateUser = useCallback(async (data: any) => {
    try {
      await userService.updateUser(userId, data);
      toast.success('User updated successfully');
      await fetchUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
      throw err;
    }
  }, [userId, fetchUser]);

  useEffect(() => {
    fetchUser();
    fetchUserOrders();
    fetchUserAssignments();
  }, [fetchUser, fetchUserOrders, fetchUserAssignments]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
    updateUser,
    userOrders,
    userAssignments,
    isLoadingOrders,
    isLoadingAssignments
  };
};