import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';
import type { Order } from '@/types/order.type';

export const ordersMutationApiSlice = createApi({
  reducerPath: 'ordersMutationApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
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
  }),
});

export const { useCreatePublicOrderMutation, useUpdateOrderMutation } =
  ordersMutationApiSlice;
