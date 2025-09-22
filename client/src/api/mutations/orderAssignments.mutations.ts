import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export const orderAssignmentsMutationsApiSlice = createApi({
  reducerPath: 'orderAssignmentsMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    createOrderAssignment: builder.mutation({
      query: ({
        orderId,
        assignedToId,
      }: {
        orderId: UUID;
        assignedToId?: UUID;
      }) => ({
        url: `/order-assignments`,
        method: 'POST',
        body: { orderId, assignedToId },
      }),
    }),
  }),
});

export const { useCreateOrderAssignmentMutation } =
  orderAssignmentsMutationsApiSlice;
