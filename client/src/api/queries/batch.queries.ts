import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export const batchQueriesApiSlice = createApi({
  reducerPath: 'batchQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchBatches: builder.query({
      query: () => '/batches',
    }),

    getBatchOrders: builder.query({
      query: ({ id }: { id: UUID }) => `/batches/${id}/orders`,
    }),
  }),
});

export const { useLazyFetchBatchesQuery, useLazyGetBatchOrdersQuery } = batchQueriesApiSlice;
