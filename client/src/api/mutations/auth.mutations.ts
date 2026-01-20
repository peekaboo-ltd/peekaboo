import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const authMutationApiSlice = createApi({
  reducerPath: 'authMutationApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // REGISTER
    register: builder.mutation({
      query: ({ name, email, phoneNumber, password }) => ({
        url: '/auth/register',
        method: 'POST',
        body: { name, email, phoneNumber, password },
      }),
    }),

    // LOGIN
    login: builder.mutation({
      query: ({ username, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { username, password },
      }),
    }),

    // ADD PHONE NUMBER (for Google auth users)
    addPhone: builder.mutation({
      query: ({ phoneNumber }) => ({
        url: '/auth/add-phone',
        method: 'PATCH',
        body: { phoneNumber },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useAddPhoneMutation,
} = authMutationApiSlice;
