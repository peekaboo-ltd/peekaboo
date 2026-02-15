import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const paymentsMutationsApiSlice = createApi({
  reducerPath: 'paymentsMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (payment) => ({
        url: '/payments',
        method: 'POST',
        body: payment,
      }),
    }),
    adminUpdatePaymentStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/payments/admin/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useAdminUpdatePaymentStatusMutation,
} = paymentsMutationsApiSlice;
