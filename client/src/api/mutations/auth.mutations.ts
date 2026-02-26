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


    forgotPassword: builder.mutation({
      query: ({ identifier }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { identifier },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, newPassword },
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
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAddPhoneMutation,
} = authMutationApiSlice;
