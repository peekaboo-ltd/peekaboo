import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export const batchMutationsApiSlice = createApi({
  reducerPath: 'batchMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    completeBatch: builder.mutation({
      query: ({ id }: { id: UUID }) => ({
        url: `/batches/${id}/complete`,
        method: 'PATCH',
      }),
    }),
  }),
});

export const { useCompleteBatchMutation } = batchMutationsApiSlice;
