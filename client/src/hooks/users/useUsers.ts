import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import userService, { UserFilters, UsersResponse } from '../../services/user.service';
import type { User } from '../../types/user.type';
import type { UserStatus } from '../../constants/user.constants';

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  pageCount: number;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  refetch: () => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;
}

export const useUsers = (initialFilters: UserFilters = {}): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: UsersResponse = await userService.getUsers(filters);
      setUsers(response.data);
      setPageCount(response.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      await userService.updateUserStatus(userId, status);
      toast.success('User status updated successfully');
      await fetchUsers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update user status';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      toast.error(errorMessage);
      throw err;
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      await userService.resetPassword(userId);
      toast.success('Password reset email sent successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    pageCount,
    filters,
    setFilters,
    refetch: fetchUsers,
    updateUserStatus,
    deleteUser,
    resetPassword,
  };
};