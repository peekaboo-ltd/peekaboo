import { useCreatePaymentMutation } from '@/api/mutations/payments.mutations';
import { useLazyFetchPaymentsQuery } from '@/api/queries/payments.queries';
import { useAppDispatch } from '@/states/hooks';
import {
  setAddToPaymentsList,
  setPaymentsList,
} from '@/states/slices/payment.slice';
import { useEffect } from 'react';

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
