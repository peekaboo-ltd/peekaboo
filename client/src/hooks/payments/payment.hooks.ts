import {
  useCreatePublicPaymentMutation,
  useCreatePaymentMutation,
  useAdminUpdatePaymentStatusMutation,
} from '@/api/mutations/payments.mutations';
import {
  useLazyFetchPublicPaymentsQuery,
  useLazyFetchPaymentsQuery,
  useLazyFetchAdminPaymentsQuery,
  useLazyFetchPaymentStatsQuery,
  useLazyExportPaymentsQuery,
  useLazyGetPaymentQuery,
} from '@/api/queries/payments.queries';
import { useAppDispatch } from '@/states/hooks';
import {
  setAddToPaymentsList,
  setAdminPaymentsList,
  setPayment,
  setPaymentsList,
  setUpdateStatusModal,
} from '@/states/slices/payment.slice';
import { usePagination } from '../common/pagination.hooks';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * @returns {Object} - The fetch public payments hook (no auth required)
 */
export const useFetchPublicPayments = () => {
  const dispatch = useAppDispatch();

  const [fetchPublicPayments, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchPublicPaymentsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setPaymentsList(data?.data?.rows));
      reset();
    }
  }, [data, dispatch, isSuccess, reset]);

  return { fetchPublicPayments, data, error, isFetching, reset, isSuccess };
};

/**
 * @returns {Object} - The create public payment hook (no auth required)
 */
export const useCreatePublicPayment = () => {
  const dispatch = useAppDispatch();

  const [createPublicPayment, { data, error, isLoading, isSuccess, reset }] =
    useCreatePublicPaymentMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setAddToPaymentsList(data?.data));
      reset();
    }
  }, [data, dispatch, isSuccess, reset]);

  return { createPublicPayment, data, error, isLoading, isSuccess, reset };
};

/**
 *
 * @returns {Object} - The fetch payments hook
 */
export const useFetchPayments = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [fetchPayments, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchPaymentsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setPaymentsList(data?.data?.rows));
      reset();
    }
  }, [data, dispatch, isSuccess, reset]);

  return { fetchPayments, data, error, isFetching, reset, isSuccess };
};

export const useGetPayment = () => {

  const dispatch = useAppDispatch();

  const [getPayment, { data, error, isFetching, isSuccess, reset }] =
    useLazyGetPaymentQuery();

    useEffect(() => {
      if (isSuccess) {
        dispatch(setPayment(data?.data));
        reset();
      }
    }, [data, isSuccess, dispatch, reset]);  

  return { getPayment, data, error, isFetching, isSuccess };
};

/**
 *
 * @returns {Object} - The create payment hook
 */
export const useCreatePayment = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [createPayment, { data, error, isLoading, isSuccess, reset }] =
    useCreatePaymentMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setAddToPaymentsList(data?.data));
      reset();
    }
  }, [data, dispatch, isSuccess, reset]);

  return { createPayment, data, error, isLoading, isSuccess, reset };
};

/**
 * Admin: Fetch payments with comprehensive filters
 */
export const useFetchAdminPayments = () => {
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

  const [fetchAdminPayments, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchAdminPaymentsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setAdminPaymentsList(data?.data?.rows));
      setTotalPages(data?.data?.totalPages);
      setTotalCount(data?.data?.totalCount);
    }
  }, [data, isSuccess, dispatch, setTotalPages, setTotalCount]);

  return {
    fetchAdminPayments,
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
    totalCount,
  };
};

/**
 * Admin: Fetch payment stats
 */
export const useFetchPaymentStats = () => {
  const [fetchPaymentStats, { data, error, isFetching, isSuccess }] =
    useLazyFetchPaymentStatsQuery();

  return {
    fetchPaymentStats,
    stats: data?.data,
    error,
    isFetching,
    isSuccess,
  };
};

/**
 * Admin: Export payments
 */
export const useExportPayments = () => {
  const [exportPayments, { data, error, isFetching, isSuccess, reset }] =
    useLazyExportPaymentsQuery();

  return {
    exportPayments,
    exportData: data?.data,
    error,
    isFetching,
    isSuccess,
    reset,
  };
};

/**
 * Admin: Update payment status
 */
export const useAdminUpdatePaymentStatus = () => {
  const dispatch = useAppDispatch();

  const [updatePaymentStatus, { data, error, isLoading, isSuccess, reset }] =
    useAdminUpdatePaymentStatusMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUpdateStatusModal(false));
      toast.success('Payment status updated successfully');
      reset();
    }
  }, [isSuccess, dispatch, reset]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to update payment status';
      toast.error(errorMessage);
    }
  }, [error]);

  return {
    updatePaymentStatus,
    data,
    error,
    isLoading,
    isSuccess,
    reset,
  };
};
