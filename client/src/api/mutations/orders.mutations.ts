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
        pickupLocation,
        deliveryLocation,
        distance,
        finalFee,
        riderId,
      }: {
        senderPhoneNumber: string;
        recipientPhoneNumber: string;
        pickupLocation?: { address: string; lat: number; lng: number };
        deliveryLocation?: { address: string; lat: number; lng: number };
        distance?: number;
        finalFee?: number;
        riderId?: string;
      }) => ({
        url: '/orders/public',
        method: 'POST',
        body: { 
          senderPhoneNumber, 
          recipientPhoneNumber,
          pickupLocation,
          deliveryLocation,
          distance,
          finalFee,
          riderId,
        },
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

export const {
  useCreatePublicOrderMutation,
  useUpdateOrderMutation,
} = ordersMutationApiSlice;
