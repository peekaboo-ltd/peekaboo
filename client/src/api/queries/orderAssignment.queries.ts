import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import { type UUID } from '../../types/base';

export const orderAssignmentQueriesApiSlice = createApi({
  reducerPath: 'orderAssignmentQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchOrderAssignments: builder.query({
      query: ({
        page,
        size,
        assignedToId,
        status,
        prioritizeUnassigned,
      }: {
        page: number;
        size: number;
        assignedToId?: UUID;
        status?: string;
        prioritizeUnassigned?: boolean;
      }) => {
        return {
          url: '/order-assignments',
          params: { page, size, assignedToId, status, prioritizeUnassigned },
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
