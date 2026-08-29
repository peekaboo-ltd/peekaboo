import { useEffect } from 'react';
import { useAppDispatch } from '@/states/hooks';
import { setUsersList, setUser, setCreateUserModal } from '@/states/slices/user.slice';
import {
  useLazyFetchUserByIdQuery,
  useLazyFetchUserCurrentLocationHistoryQuery,
  useLazyFetchUsersQuery,
  useLazyFetchUsersTrackingQuery,
  useLazyFetchRiderManagementPerformanceQuery,
  useLazyFetchRiderManagementAttendanceQuery,
  useLazyFetchRiderManagementProblemReportsQuery,
} from '@/api/queries/users.queries';
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
import { useI18n } from '@/i18n/i18n';

// FETCH USERS
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

// CREATE USER
export const useCreateUser = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [createUser, { data, error, isLoading, isSuccess, reset }] =
    useCreateUserMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
      dispatch(setCreateUserModal(false));
      toast.success(t('users.createdSuccess'));
      reset();
    }
  }, [data, isSuccess, dispatch, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('users.createFailed');
      toast.error(errorMessage);
    }
  }, [error, t]);

  const handleCreateUser = (userData: CreateUserRequest) => {
    createUser(userData);
  };

  return { createUser: handleCreateUser, data, error, isLoading, isSuccess, reset };
};

// UPDATE USER
export const useUpdateUser = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [updateUser, { data, error, isLoading, isSuccess, reset }] =
    useUpdateUserMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
      toast.success(t('users.updatedSuccess'));
      reset();
    }
  }, [data, isSuccess, dispatch, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('users.updateFailed');
      toast.error(errorMessage);
    }
  }, [error, t]);

  const handleUpdateUser = (userData: UpdateUserRequest) => {
    updateUser(userData);
  };

  return { updateUser: handleUpdateUser, data, error, isLoading, isSuccess, reset };
};

// UPDATE USER STATUS
export const useUpdateUserStatus = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [updateUserStatus, { data, error, isLoading, isSuccess, reset }] =
    useUpdateUserStatusMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
      toast.success(t('users.statusSuccess'));
      reset();
    }
  }, [data, isSuccess, dispatch, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('users.statusFailed');
      toast.error(errorMessage);
    }
  }, [error, t]);

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

// DELETE USER
export const useDeleteUser = () => {
  const { t } = useI18n();
  const [deleteUser, { data, error, isLoading, isSuccess, reset }] =
    useDeleteUserMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success(t('users.deletedSuccess'));
      reset();
    }
  }, [isSuccess, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('users.deleteFailed');
      toast.error(errorMessage);
    }
  }, [error, t]);

  const handleDeleteUser = (id: UUID) => {
    deleteUser(id);
  };

  return { deleteUser: handleDeleteUser, data, error, isLoading, isSuccess, reset };
};

// FETCH USER BY ID
export const useFetchUserById = () => {
  const dispatch = useAppDispatch();

  const [fetchUserById, { data, error, isFetching, isSuccess, reset }] =
    useLazyFetchUserByIdQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.data));
    }
  }, [data, isSuccess, dispatch]);

  return { fetchUserById, data, error, isFetching, isSuccess, reset };
}

// FETCH USERS TRACKING
export const useFetchUsersTracking = () => {
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

  const [fetchUsersTracking, { data, error, isFetching, isSuccess, reset }] =
    useLazyFetchUsersTrackingQuery();

  useEffect(() => {
    if (isSuccess) {
      setTotalPages(data?.data?.totalPages ?? 0);
      setTotalCount(data?.data?.totalCount ?? 0);
    }
  }, [data, isSuccess, setTotalPages, setTotalCount]);

  return {
    fetchUsersTracking,
    data,
    error,
    isFetching,
    isSuccess,
    reset,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  };
};

export const useFetchRiderManagementPerformance = () => {
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

  const [fetchRiderManagementPerformance, { data, error, isFetching, isSuccess, reset }] =
    useLazyFetchRiderManagementPerformanceQuery();

  useEffect(() => {
    if (isSuccess) {
      setTotalPages(data?.data?.totalPages ?? 0);
      setTotalCount(data?.data?.totalCount ?? 0);
    }
  }, [data, isSuccess, setTotalPages, setTotalCount]);

  return {
    fetchRiderManagementPerformance,
    data,
    error,
    isFetching,
    isSuccess,
    reset,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  };
};

export const useFetchRiderManagementAttendance = () => {
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

  const [fetchRiderManagementAttendance, { data, error, isFetching, isSuccess, reset }] =
    useLazyFetchRiderManagementAttendanceQuery();

  useEffect(() => {
    if (isSuccess) {
      setTotalPages(data?.data?.totalPages ?? 0);
      setTotalCount(data?.data?.totalCount ?? 0);
    }
  }, [data, isSuccess, setTotalPages, setTotalCount]);

  return {
    fetchRiderManagementAttendance,
    data,
    error,
    isFetching,
    isSuccess,
    reset,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  };
};

export const useFetchRiderManagementProblemReports = () => {
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

  const [fetchRiderManagementProblemReports, { data, error, isFetching, isSuccess, reset }] =
    useLazyFetchRiderManagementProblemReportsQuery();

  useEffect(() => {
    if (isSuccess) {
      setTotalPages(data?.data?.totalPages ?? 0);
      setTotalCount(data?.data?.totalCount ?? 0);
    }
  }, [data, isSuccess, setTotalPages, setTotalCount]);

  return {
    fetchRiderManagementProblemReports,
    data,
    error,
    isFetching,
    isSuccess,
    reset,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  };
};

export const useFetchUserCurrentLocationHistory = () => {
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

  const [fetchUserCurrentLocationHistory, { data, error, isFetching, isSuccess, reset }] =
    useLazyFetchUserCurrentLocationHistoryQuery();

  useEffect(() => {
    if (isSuccess) {
      setTotalPages(data?.data?.totalPages ?? 0);
      setTotalCount(data?.data?.totalCount ?? 0);
    }
  }, [data, isSuccess, setTotalPages, setTotalCount]);

  return {
    fetchUserCurrentLocationHistory,
    data,
    error,
    isFetching,
    isSuccess,
    reset,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  };
};
