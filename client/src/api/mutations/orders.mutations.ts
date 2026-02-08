import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';
import type { Order } from '@/types/order.type';

export const ordersMutationApiSlice = createApi({
  reducerPath: 'ordersMutationApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // CREATE AUTHENTICATED ORDER
    createOrder: builder.mutation({
      query: ({
        senderPhoneNumber,
        recipientPhoneNumber,
      }: {
        senderPhoneNumber: string;
        recipientPhoneNumber: string;
      }) => ({
        url: '/orders',
        method: 'POST',
        body: { senderPhoneNumber, recipientPhoneNumber },
      }),
    }),

    // CREATE PUBLIC ORDER
    createPublicOrder: builder.mutation({
      query: ({
        senderPhoneNumber,
        recipientPhoneNumber,
      }: {
        senderPhoneNumber: string;
        recipientPhoneNumber: string;
      }) => ({
        url: '/orders/public',
        method: 'POST',
        body: { senderPhoneNumber, recipientPhoneNumber },
      }),
    }),

    // UPDATE ORDER
    updateOrder: builder.mutation({
      query: ({ id, order }: { id: UUID; order: Partial<Order> }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        body: { order },
      }),
    }),

    // DELETE ORDER
    deleteOrder: builder.mutation({
      query: (id: UUID) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreatePublicOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersMutationApiSlice;
