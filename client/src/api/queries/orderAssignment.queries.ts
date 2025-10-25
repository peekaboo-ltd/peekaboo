import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import { type UUID } from '../../types/base';

export const orderAssignmentQueriesApiSlice = createApi({
  reducerPath: 'orderAssignmentQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchOrderAssignments: builder.query({
      query: ({ page, size }: { page: number; size: number }) => {
        return {
          url: '/order-assignments',
          params: { page, size },
        };
      },
    }),

    getOrderAssignment: builder.query({
      query: ({ id }: { id: UUID }) => `/order-assignments/${id}`,
    }),
  }),
});

export const {
  useLazyFetchOrderAssignmentsQuery,
  useLazyGetOrderAssignmentQuery,
} = orderAssignmentQueriesApiSlice;
