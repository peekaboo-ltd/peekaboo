import { useCallback, useEffect, useState } from 'react';
import {
  useLazyFetchBatchesQuery,
  useLazyGetBatchByIdQuery,
  useLazyGetBatchOrdersQuery,
} from '@/api/queries/batch.queries';
import { useCompleteBatchMutation } from '@/api/mutations/batch.mutations';
import type { UUID } from '@/types';
import type { Batch } from '@/types/batch.type';

export const useFetchBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [fetchBatches, { data, error, isFetching, isSuccess }] = useLazyFetchBatchesQuery();

  useEffect(() => {
    if (isSuccess && data?.data) {
      setBatches(data.data);
    }
  }, [data, isSuccess]);

  return { fetchBatches, batches, data, error, isFetching, isSuccess };
};

export const useGetBatchById = () => {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [getBatchById, { data, error, isFetching, isSuccess }] =
    useLazyGetBatchByIdQuery();

  useEffect(() => {
    if (isSuccess && data?.data) {
      setBatch(data.data);
    }
  }, [data, isSuccess]);

  const fetchBatchById = useCallback(
    (id: UUID) => getBatchById({ id }),
    [getBatchById],
  );

  return { fetchBatchById, batch, setBatch, data, error, isFetching, isSuccess };
};

export const useGetBatchOrders = () => {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [getBatchOrders, { data, error, isFetching, isSuccess }] =
    useLazyGetBatchOrdersQuery();

  useEffect(() => {
    if (isSuccess && data?.data) {
      setBatch(data.data);
    }
  }, [data, isSuccess]);

  const fetchBatchOrders = useCallback(
    (id: UUID) => getBatchOrders({ id }),
    [getBatchOrders],
  );

  return { fetchBatchOrders, batch, setBatch, data, error, isFetching, isSuccess };
};

export const useCompleteBatch = () => {
  const [completeBatch, { data, error, isLoading, isSuccess, isError, reset }] =
    useCompleteBatchMutation();

  return { completeBatch, data, error, isLoading, isSuccess, isError, reset };
};
