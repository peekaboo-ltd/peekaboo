import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import { type UUID } from '../../types/base';

export const ordersQueriesApiSlice = createApi({
  reducerPath: 'ordersQueriesApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    fetchOrders: builder.query({
        query: ({ page, size, limit, senderId, recipientId, search, status }: { 
          page?: number; 
          size?: number; 
          limit?: number;
          senderId?: string; 
          recipientId?: string;
          search?: string;
          status?: string;
        }) => {
          const params: any = { page, size: size || limit };
          if (senderId) params.senderId = senderId;
          if (recipientId) params.recipientId = recipientId;
          if (search) params.search = search;
          if (status) params.status = status;
          return {
            url: '/orders',
            params,
          };
      },
      providesTags: ['Orders'],
    }),
    
    getOrder: builder.query({
      query: ({ id }: { id: UUID }) => `/orders/${id}`,
      providesTags: ( { id }) => [{ type: 'Orders', id }],
    }),

    // GET ORDER TRACKING
    getOrderTracking: builder.query({
      query: ({ id }: { id: UUID }) => `/orders/${id}/tracking`,
    }),
  }),
});

export const { useLazyFetchOrdersQuery, useLazyGetOrderQuery, useLazyGetOrderTrackingQuery } = ordersQueriesApiSlice;
