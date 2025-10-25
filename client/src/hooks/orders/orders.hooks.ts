import { useCallback, useEffect, useState } from 'react';
import {
  useCreatePublicOrderMutation,
  useUpdateOrderMutation,
} from '../../api/mutations/orders.mutations';
import { useNavigate } from 'react-router-dom';
import { useLazyFetchOrdersQuery, useLazyGetOrderQuery } from '@/api/queries/orders.queries';
import { useAppDispatch } from '@/states/hooks';
import { setOrder, setOrdersList } from '@/states/slices/order.slice';
import { ORDER_FEE_RANGES } from '@/constants/order.constants';
import { usePagination } from '../common/pagination.hooks';

/**
 *
 * @returns {Object} - The create public order hook
 */
export const useCreatePublicOrder = () => {
  // STATE VARIABLES
  // NAVIGATION
  const navigate = useNavigate();

  const [createPublicOrder, { data, error, isLoading, reset, isSuccess }] =
    useCreatePublicOrderMutation();

  useEffect(() => {
    if (isSuccess) {
      navigate(`/p/orders/${data?.data?.id}`);
      reset();
    }
  }, [data, isSuccess, navigate, reset]);

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

export const useGetOrderFees = () => {
  const [orderFee, setOrderFee] = useState<number | undefined>(undefined);

  // STATE VARIABLES
  const getOrderFee = useCallback((distance: number) => {
    const fee = ORDER_FEE_RANGES.find(
      (range) => distance >= range.min && distance <= range.max
    )?.fee;
    setOrderFee(fee ?? 0);
  }, []);

  return { getOrderFee, orderFee };
};

export const useFetchOrders = () => {

  const dispatch = useAppDispatch();

  // PAGINATION
  const { page, setPage, size, setSize, totalPages, setTotalPages, totalElements, setTotalElements } = usePagination();

  const [fetchOrders, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchOrdersQuery();

    useEffect(() => {
      if (isSuccess) {
        dispatch(setOrdersList(data?.data?.rows));
        setTotalPages(data?.data?.totalPages);
        setTotalElements(data?.data?.totalElements);
      }
    }, [data, isSuccess, dispatch, setTotalPages, setTotalElements]);

  return { fetchOrders, data, error, isFetching, reset, isSuccess, page, setPage, size, setSize, totalPages, setTotalPages, totalElements, setTotalElements };
};