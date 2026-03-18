import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export const orderAssignmentsMutationsApiSlice = createApi({
  reducerPath: 'orderAssignmentsMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // CREATE PUBLIC ORDER ASSIGNMENT (no auth required)
    createPublicOrderAssignment: builder.mutation({
      query: ({
        orderId,
        assignedToId,
      }: {
        orderId: UUID;
        assignedToId?: UUID;
      }) => ({
        url: `/order-assignments/public`,
        method: 'POST',
        body: { orderId, assignedToId },
      }),
    }),

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
  }),
});

export const {
  useCreatePublicOrderAssignmentMutation,
  useCreateOrderAssignmentMutation,
  useAcceptOrderAssignmentMutation,
  useRejectOrderAssignmentMutation,
} = orderAssignmentsMutationsApiSlice;
