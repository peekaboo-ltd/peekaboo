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

    // ACCEPT ORDER ASSIGNMENT
    acceptOrderAssignment: builder.mutation({
      query: ({ id }: { id: UUID }) => ({
        url: `/order-assignments/${id}/accept`,
        method: 'PATCH',
      }),
    }),

    // REJECT ORDER ASSIGNMENT
    rejectOrderAssignment: builder.mutation({
      query: ({ id }: { id: UUID }) => ({
        url: `/order-assignments/${id}/reject`,
        method: 'PATCH',
      }),
    }),

    // COMPLETE ORDER ASSIGNMENT
    completeOrderAssignment: builder.mutation({
      query: ({ id }: { id: UUID }) => ({
        url: `/order-assignments/${id}/complete`,
        method: 'PATCH',
      }),
    }),
  }),
});

export const {
  useCreateOrderAssignmentMutation,
  useAcceptOrderAssignmentMutation,
  useRejectOrderAssignmentMutation,
  useCompleteOrderAssignmentMutation,
} = orderAssignmentsMutationsApiSlice;
