import { useEffect } from 'react';
import { useAppDispatch } from '@/states/hooks';
import { setUsersList, setUser, setCreateUserModal } from '@/states/slices/user.slice';
import { useLazyFetchUsersQuery } from '@/api/queries/users.queries';
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
} from '@/api/mutations/users.mutations';
import { usePagination } from '../common/pagination.hooks';
import { UUID } from '@/types';
import { toast } from 'sonner';

export const useFetchUsers = () => {
  const dispatch = useAppDispatch();

  const {
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
  } = usePagination();

  const [fetchUsers, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchUsersQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUsersList(data?.data?.rows));
      setTotalPages(data?.data?.totalPages);
      setTotalCount(data?.data?.totalCount);
    }
  }, [data, isSuccess, dispatch, setTotalPages, setTotalCount]);

  return {
    fetchUsers,
    data,
    error,
    isFetching,
    reset,
    isSuccess,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
  };
};

export const useCreateUser = () => {
  const dispatch = useAppDispatch();

  const [createUser, { data, error, isLoading, isSuccess, reset }] =
    useCreateUserMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
      dispatch(setCreateUserModal(false));
      toast.success('User created successfully');
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to create user';
      toast.error(errorMessage);
    }
  }, [error]);

  const handleCreateUser = (userData: CreateUserRequest) => {
    createUser(userData);
  };

  return { createUser: handleCreateUser, data, error, isLoading, isSuccess, reset };
};

export const useUpdateUser = () => {
  const dispatch = useAppDispatch();

  const [updateUser, { data, error, isLoading, isSuccess, reset }] =
    useUpdateUserMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
      toast.success('User updated successfully');
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to update user';
      toast.error(errorMessage);
    }
  }, [error]);

  const handleUpdateUser = (userData: UpdateUserRequest) => {
    updateUser(userData);
  };

  return { updateUser: handleUpdateUser, data, error, isLoading, isSuccess, reset };
};

export const useUpdateUserStatus = () => {
  const dispatch = useAppDispatch();

  const [updateUserStatus, { data, error, isLoading, isSuccess, reset }] =
    useUpdateUserStatusMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
      toast.success('User status updated successfully');
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to update user status';
      toast.error(errorMessage);
    }
  }, [error]);

  const handleUpdateUserStatus = (userData: UpdateUserStatusRequest) => {
    updateUserStatus(userData);
  };

  return {
    updateUserStatus: handleUpdateUserStatus,
    data,
    error,
    isLoading,
    isSuccess,
    reset,
  };
};

export const useDeleteUser = () => {
  const [deleteUser, { data, error, isLoading, isSuccess, reset }] =
    useDeleteUserMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success('User deleted successfully');
      reset();
    }
  }, [isSuccess, reset]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to delete user';
      toast.error(errorMessage);
    }
  }, [error]);

  const handleDeleteUser = (id: UUID) => {
    deleteUser(id);
  };

  return { deleteUser: handleDeleteUser, data, error, isLoading, isSuccess, reset };
};
