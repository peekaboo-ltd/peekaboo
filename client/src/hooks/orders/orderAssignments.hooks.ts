import {
  useCreatePublicOrderAssignmentMutation,
  useCreateOrderAssignmentMutation,
  useAcceptOrderAssignmentMutation,
  useRejectOrderAssignmentMutation,
} from '@/api/mutations/orderAssignments.mutations';
import {
  useLazyFetchOrderAssignmentsQuery,
  useLazyGetOrderAssignmentQuery,
} from '@/api/queries/orderAssignment.queries';
import { useAppDispatch } from '@/states/hooks';
import {
  setOrderAssignment,
  setOrderAssignmentsList,
} from '@/states/slices/orderAssignment.slice';
import { usePagination } from '../common/pagination.hooks';
import { useEffect } from 'react';

export const useCreatePublicOrderAssignment = () => {
  const [createPublicOrderAssignment, { data, error, isLoading, isSuccess, reset }] =
    useCreatePublicOrderAssignmentMutation();

  useEffect(() => {
    if (isSuccess) {
      reset();
    }
  }, [isSuccess, reset]);

  return { createPublicOrderAssignment, data, error, isLoading, isSuccess, reset };
};

export const useCreateOrderAssignment = () => {
  const [createOrderAssignment, { data, error, isLoading, isSuccess, reset }] =
    useCreateOrderAssignmentMutation();

  useEffect(() => {
    if (isSuccess) {
      reset();
    }
  }, [isSuccess, reset]);

  return { createOrderAssignment, data, error, isLoading, isSuccess, reset };
};

/**
 * @returns {Object} - The get order assignment hook
 */
export const useGetOrderAssignment = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [getOrderAssignment, { data, error, isFetching, reset, isSuccess }] =
    useLazyGetOrderAssignmentQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrderAssignment(data?.data));
      reset();
    }
  }, [data, isSuccess, dispatch, reset]);

  return { getOrderAssignment, data, error, isFetching, reset, isSuccess };
};

export const useFetchOrderAssignments = () => {
  const dispatch = useAppDispatch();

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

  const [fetchOrderAssignments, { data, error, isFetching, reset, isSuccess }] =
    useLazyFetchOrderAssignmentsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setOrderAssignmentsList(data?.data?.rows));
      setTotalPages(data?.data?.totalPages);
      setTotalCount(data?.data?.totalCount);
    }
  }, [data, isSuccess, dispatch, setTotalPages, setTotalCount]);

  return {
    fetchOrderAssignments,
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

/**
 * @returns {Object} - The accept order assignment hook
 */
export const useAcceptOrderAssignment = () => {
  const [acceptOrderAssignment, { data, error, isLoading, isSuccess, reset }] =
    useAcceptOrderAssignmentMutation();

  return { acceptOrderAssignment, data, error, isLoading, isSuccess, reset };
};

/**
 * @returns {Object} - The reject order assignment hook
 */
export const useRejectOrderAssignment = () => {
  const [rejectOrderAssignment, { data, error, isLoading, isSuccess, reset }] =
    useRejectOrderAssignmentMutation();

  return { rejectOrderAssignment, data, error, isLoading, isSuccess, reset };
};
