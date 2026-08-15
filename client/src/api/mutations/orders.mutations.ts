import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';
import type { Order, OrderLocation } from '@/types/order.type';
import type { ImportTemplateRow } from '@/types/orderImport.type';

interface CreateOrderArgs {
  senderPhoneNumber: string;
  recipientPhoneNumber: string;
  locationFrom?: OrderLocation;
  locationTo?: OrderLocation;
}

export const ordersMutationApiSlice = createApi({
  reducerPath: 'ordersMutationApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // CREATE AUTHENTICATED ORDER
    createOrder: builder.mutation({
      query: ({
        senderPhoneNumber,
        recipientPhoneNumber,
        locationFrom,
        locationTo,
      }: CreateOrderArgs) => ({
        url: '/orders',
        method: 'POST',
        body: {
          senderPhoneNumber,
          recipientPhoneNumber,
          ...(locationFrom ? { locationFrom } : {}),
          ...(locationTo ? { locationTo } : {}),
        },
      }),
    }),

    // CREATE PUBLIC ORDER
    createPublicOrder: builder.mutation({
      query: ({
        senderPhoneNumber,
        recipientPhoneNumber,
        locationFrom,
        locationTo,
      }: CreateOrderArgs) => ({
        url: '/orders/public',
        method: 'POST',
        body: {
          senderPhoneNumber,
          recipientPhoneNumber,
          ...(locationFrom ? { locationFrom } : {}),
          ...(locationTo ? { locationTo } : {}),
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

    // UPDATE PUBLIC ORDER (no auth required, limited fields)
    updatePublicOrder: builder.mutation({
      query: ({ id, order }: { id: UUID; order: Partial<Order> }) => ({
        url: `/orders/public/${id}`,
        method: 'PATCH',
        body: { order },
      }),
    }),

    deferOrderPayment: builder.mutation({
      query: ({ id }: { id: UUID }) => ({
        url: `/orders/${id}/defer-payment`,
        method: 'POST',
      }),
    }),

    // DELETE ORDER
    deleteOrder: builder.mutation({
      query: (id: UUID) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
    }),

    // IMPORT BULK ORDERS — always creates a DRAFT batch
    importBulkOrders: builder.mutation({
      query: ({
        rows,
        batch,
      }: {
        rows: ImportTemplateRow[];
        batch?: { name?: string; description?: string };
      }) => ({
        url: '/orders/import/bulk',
        method: 'POST',
        body: { rows, batch },
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreatePublicOrderMutation,
  useUpdateOrderMutation,
  useUpdatePublicOrderMutation,
  useDeferOrderPaymentMutation,
  useDeleteOrderMutation,
  useImportBulkOrdersMutation,
} = ordersMutationApiSlice;
