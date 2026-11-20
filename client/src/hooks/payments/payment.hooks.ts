import {
  useCreatePublicPaymentMutation,
  useCreatePaymentMutation,
  useAdminUpdatePaymentStatusMutation,
  useAdminRefundPaymentMutation,
} from '@/api/mutations/payments.mutations';
import {
  useLazyFetchPublicPaymentsQuery,
  useLazyFetchPaymentsQuery,
  useLazyFetchAdminPaymentsQuery,
  useLazyFetchPaymentStatsQuery,
  useLazyExportPaymentsQuery,
  useLazyGetPaymentQuery,
  useLazyFetchProviderBalanceQuery,
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
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();

  const [updatePaymentStatus, { data, error, isLoading, isSuccess, reset }] =
    useAdminUpdatePaymentStatusMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUpdateStatusModal(false));
      toast.success(t('paymentStatus.updated'));
      reset();
    }
  }, [isSuccess, dispatch, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('paymentStatus.updateError');
      toast.error(errorMessage);
    }
  }, [error, t]);

  return {
    updatePaymentStatus,
    data,
    error,
    isLoading,
    isSuccess,
    reset,
  };
};

/**
 * Admin: refund an MVend payment (rollback or credit). Calls onSuccess so the
 * caller can refetch the payment with its relations.
 */
export const useAdminRefundPayment = (onSuccess?: () => void) => {
  const { t } = useI18n();
  const [refundPayment, { data, error, isLoading, isSuccess, reset }] =
    useAdminRefundPaymentMutation();

  useEffect(() => {
    if (isSuccess) {
      const state = data?.data?.metadata?.mvendRefund?.state;
      if (state === 'unknown') {
        toast.warning(t('paymentRefund.unknown'));
      } else {
        toast.success(t('paymentRefund.requested'));
      }
      onSuccess?.();
      reset();
    }
  }, [isSuccess, data, onSuccess, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('paymentRefund.error');
      toast.error(errorMessage);
    }
  }, [error, t]);

  return { refundPayment, isLoading, isSuccess, error };
};

// MVend's balance response is undocumented; read the first numeric field
// that looks like a balance.
const BALANCE_KEYS = ['balance', 'available_balance', 'current_balance', 'account_balance', 'app_balance'];

export const pickBalance = (payload?: Record<string, unknown>): number | undefined => {
  if (!payload) return undefined;
  const sources = [payload, payload.data as Record<string, unknown> | undefined];
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of BALANCE_KEYS) {
      const value = Number(source[key]);
      if (source[key] !== undefined && source[key] !== null && Number.isFinite(value)) return value;
    }
  }
  return undefined;
};

/**
 * Admin: MVend merchant account balance
 */
export const useFetchProviderBalance = () => {
  const [fetchProviderBalance, { data, error, isFetching }] =
    useLazyFetchProviderBalanceQuery();

  return {
    fetchProviderBalance,
    balance: pickBalance(data?.data),
    error,
    isFetching,
  };
};
