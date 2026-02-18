import { useCallback, useEffect, useState } from 'react';
import {
  useCreateOrderMutation,
  useCreatePublicOrderMutation,
  useDeleteOrderMutation,
  useImportBulkOrdersMutation,
  useUpdateOrderMutation,
} from '../../api/mutations/orders.mutations';
import { useNavigate } from 'react-router-dom';
import {
  useLazyFetchOrdersQuery,
  useLazyGetOrderQuery,
  useLazyGetOrderByReferenceIdQuery,
} from '@/api/queries/orders.queries';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrder, setOrdersList } from '@/states/slices/order.slice';
import {
  setToken,
  setUser,
  setIsAuthenticated,
} from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import { ORDER_FEE_RANGES } from '@/constants/order.constants';
import { usePagination } from '../common/pagination.hooks';
import { RoleTypes } from '@/types/auth.type';

/**
 *
 * @returns {Object} - The create public order hook
 */
export const useCreatePublicOrder = () => {
  // STATE VARIABLES
  // NAVIGATION
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [createPublicOrder, { data, error, isLoading, reset, isSuccess }] =
    useCreatePublicOrderMutation();

  useEffect(() => {
    if (isSuccess && data?.data) {
      const { order, auth } = data.data;

      if (!isAuthenticated && auth?.token && auth?.user) {
        // Store auth data in localStorage
        localStorageUtil.setItem('token', auth.token);
        localStorageUtil.setItem('user', auth.user);

        // Update Redux state
        dispatch(setToken(auth.token));
        dispatch(setUser(auth.user));
        dispatch(setIsAuthenticated(true));
      }

      // Navigate to order details
      navigate(`/p/orders/${order.id}`);
      reset();
    }
  }, [data, isSuccess, navigate, reset, dispatch, isAuthenticated]);

  return { createPublicOrder, data, error, isLoading, reset, isSuccess };
};

/**
 * Delete order hook
 */
export const useDeleteOrder = () => {
  const [deleteOrder, { data, error, isLoading, reset, isSuccess }] =
    useDeleteOrderMutation();

  return { deleteOrder, data, error, isLoading, reset, isSuccess };
};

/**
 *
 * @returns {Object} - The create authenticated order hook
 */
export const useCreateOrder = () => {
  const navigate = useNavigate();

  const [createOrder, { data, error, isLoading, reset, isSuccess, isError }] =
    useCreateOrderMutation();

  useEffect(() => {
    if (isSuccess && data?.data) {
      const order = data.data;
      navigate(`/p/orders/${order.id}`);
      reset();
    }
  }, [data, isSuccess, navigate, reset]);

  return { createOrder, data, error, isLoading, reset, isSuccess, isError };
};

export const useImportBulkOrders = () => {
  const [
    importBulkOrders,
    { data, error, isLoading, isSuccess, isError, reset },
  ] = useImportBulkOrdersMutation();

  return {
    importBulkOrders,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
};

/**
 * @returns {Object} - The get order hook
 */
export const useGetOrder = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [getOrder, { data, error, isFetching, reset, isSuccess }] =
    useLazyGetOrderQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrder(data?.data));
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  return { getOrder, data, error, isFetching, reset, isSuccess };
};

/**
 * @returns {Object} - The update order hook
 */
export const useUpdateOrder = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [updateOrder, { data, error, isLoading, isSuccess, reset }] =
    useUpdateOrderMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrder(data?.data));
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  return { updateOrder, data, error, isLoading, isSuccess, reset };
};

export const useGetOrderFees = (
  initialFee?: number,
  resetKey?: string | number,
) => {
  const [orderFee, setOrderFee] = useState<number | undefined>(initialFee);

  // Reset fee when the tracked entity changes (e.g., navigating to a different order)
  useEffect(() => {
    if (resetKey !== undefined) {
      setOrderFee(initialFee);
    }
  }, [initialFee, resetKey]);

  // Sync with initialFee when it changes (e.g., when order loads)
  useEffect(() => {
    if (initialFee !== undefined && initialFee > 0 && orderFee === undefined) {
      setOrderFee(initialFee);
    }
  }, [initialFee, orderFee]);

  // STATE VARIABLES
  const getOrderFee = useCallback(
    (distance: number) => {
      if (!distance || distance <= 0) {
        // Don't reset to undefined if we have an initial fee
        if (!initialFee) {
          setOrderFee(undefined);
        }
        return;
      }

      // Find the matching fee range
      const matchingRange = ORDER_FEE_RANGES.find((range) => {
        if (range.max === Infinity) {
          return distance >= range.min;
        }
        return distance >= range.min && distance <= range.max;
      });

      if (matchingRange) {
        setOrderFee(matchingRange.fee);
      } else {
        // Fallback: use the highest fee if distance exceeds all ranges
        const highestFee = ORDER_FEE_RANGES[ORDER_FEE_RANGES.length - 1]?.fee;
        setOrderFee(highestFee ?? 0);
      }
    },
    [initialFee],
  );

  return { getOrderFee, orderFee };
};

/**
 * @returns {Object} - The get order by reference ID hook
 */
export const useGetOrderByReferenceId = () => {
  const dispatch = useAppDispatch();

  const [
    getOrderByReferenceId,
    { data, error, isFetching, reset, isSuccess, isError },
  ] = useLazyGetOrderByReferenceIdQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrder(data?.data));
    }
  }, [data, isSuccess, dispatch]);

  return {
    getOrderByReferenceId,
    data,
    error,
    isFetching,
    reset,
    isSuccess,
    isError,
  };
};

export const useFetchOrders = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // PAGINATION
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

  const [fetchOrders, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchOrdersQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrdersList(data?.data?.rows));
      setTotalPages(data?.data?.totalPages);
      setTotalCount(data?.data?.totalCount);
    }
  }, [data, isSuccess, dispatch, setTotalPages, setTotalCount]);

  // Check if user is a customer
  const isCustomerOrBusiness = user?.userRoles?.some(
    (userRole) =>
      userRole.role.name === RoleTypes.CUSTOMER ||
      userRole.role.name === RoleTypes.BUSINESS,
  );

  // Wrap fetchOrders to add createdById for customers
  const wrappedFetchOrders = useCallback(
    (params: {
      page: number;
      size: number;
      createdById?: string;
      senderId?: string;
      recipientId?: string;
      status?: string;
      statusGroup?: 'recent' | 'pending' | 'active' | 'completed';
      referenceId?: string;
    }) => {
      const queryParams =
        isCustomerOrBusiness && user?.id
          ? { ...params, createdById: params.createdById ?? user.id }
          : params;
      return fetchOrders(queryParams);
    },
    [fetchOrders, isCustomerOrBusiness, user?.id],
  );

  return {
    fetchOrders: wrappedFetchOrders,
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
