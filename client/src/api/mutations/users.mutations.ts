import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';
import type { User } from '@/types/user.type';

export const usersApiSlice = createApi({
  reducerPath: 'usersMutationApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // CREATE USER
    createUser: builder.mutation({
      query: ({ phoneNumber, roles, name, email, password, status, nationality, dateOfBirth }: {
        phoneNumber: string;
        roles: string[];
        name?: string;
        email?: string;
        password: string;
        status?: string;
        nationality?: string;
        dateOfBirth?: string;
      }) => ({
        url: `/users`,
        method: 'POST',
        body: { phoneNumber, roles, name, email, password, status, nationality, dateOfBirth },
      }),
      invalidatesTags: ['Users'],
    }),
    // UPDATE USER
    updateUser: builder.mutation({
      query: ({ id, user }: { id: UUID; user: Partial<User> }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: { user },
      }),
      invalidatesTags: ['Users'],
    }), 
    // DELETE USER
    deleteUser: builder.mutation({
        query: (id: UUID) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});
export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;