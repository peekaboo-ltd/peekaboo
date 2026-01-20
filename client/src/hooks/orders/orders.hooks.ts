import { useCallback, useEffect, useState } from 'react';
import {
  useCreatePublicOrderMutation,
  useUpdateOrderMutation,
} from '../../api/mutations/orders.mutations';
import { useNavigate } from 'react-router-dom';
import { useLazyFetchOrdersQuery, useLazyGetOrderQuery } from '@/api/queries/orders.queries';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrder, setOrdersList } from '@/states/slices/order.slice';
import { setToken, setUser, setIsAuthenticated } from '@/states/slices/auth.slice';
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

  const [createPublicOrder, { data, error, isLoading, reset, isSuccess }] =
    useCreatePublicOrderMutation();

  useEffect(() => {
    if (isSuccess && data?.data) {
      const { order, auth } = data.data;

      // Store auth data in localStorage
      localStorageUtil.setItem('token', auth.token);
      localStorageUtil.setItem('user', auth.user);

      // Update Redux state
      dispatch(setToken(auth.token));
      dispatch(setUser(auth.user));
      dispatch(setIsAuthenticated(true));

      // Navigate to order details
      navigate(`/p/orders/${order.id}`);
      reset();
    }
  }, [data, isSuccess, navigate, reset, dispatch]);

  return { createPublicOrder, data, error, isLoading, reset, isSuccess };
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

export const useGetOrderFees = (initialFee?: number) => {
  const [orderFee, setOrderFee] = useState<number | undefined>(initialFee);

  // Sync with initialFee when it changes (e.g., when order loads)
  useEffect(() => {
    if (initialFee !== undefined && initialFee > 0 && orderFee === undefined) {
      setOrderFee(initialFee);
    }
  }, [initialFee, orderFee]);

  // STATE VARIABLES
  const getOrderFee = useCallback((distance: number) => {
    if (!distance || distance <= 0) {
      // Don't reset to undefined if we have an initial fee
      if (!initialFee) {
        setOrderFee(undefined);
      }
      return;
    }

    // Find the matching fee range
    const matchingRange = ORDER_FEE_RANGES.find(
      (range) => {
        if (range.max === Infinity) {
          return distance >= range.min;
        }
        return distance >= range.min && distance <= range.max;
      }
    );

    if (matchingRange) {
      setOrderFee(matchingRange.fee);
    } else {
      // Fallback: use the highest fee if distance exceeds all ranges
      const highestFee = ORDER_FEE_RANGES[ORDER_FEE_RANGES.length - 1]?.fee;
      setOrderFee(highestFee ?? 0);
    }
  }, [initialFee]);

  return { getOrderFee, orderFee };
};

export const useFetchOrders = () => {

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // PAGINATION
  const { page, setPage, size, setSize, totalPages, setTotalPages, totalCount, setTotalCount } = usePagination();

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
  const isCustomer = user?.userRoles?.some(
    (userRole) => userRole.role.name === RoleTypes.CUSTOMER
  );

  // Wrap fetchOrders to add createdById for customers
  const wrappedFetchOrders = useCallback(
    (params: { page: number; size: number }) => {
      const queryParams = isCustomer && user?.id
        ? { ...params, createdById: user.id }
        : params;
      return fetchOrders(queryParams);
    },
    [fetchOrders, isCustomer, user?.id]
  );

  return { fetchOrders: wrappedFetchOrders, data, error, isFetching, reset, isSuccess, page, setPage, size, setSize, totalPages, setTotalPages, totalCount, setTotalCount };
};