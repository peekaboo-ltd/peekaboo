import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';
import type { User } from '@/types/user.type';
import { RoleTypes } from '@/types/auth.type';

export const usersQueriesApiSlice = createApi({
  reducerPath: 'usersQueriesApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // FETCH USERS WITH PAGINATION AND SEARCH
    fetchUsers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = '',
        createdFrom,
        createdTo,
        status,
        roles,
      }: {
        page?: number;
        limit?: number;
        search?: string;
        createdFrom?: string;
        createdTo?: string;
        status?: string;
        roles?: RoleTypes[];
      }) => ({
        url: '/users',
        params: {
          page,
          limit,
          search: search || undefined,
          createdFrom: createdFrom || undefined,
          createdTo: createdTo || undefined,
          status: status || undefined,
          roles: roles && roles.length > 0 ? roles : undefined,
        },
      }),
      providesTags: ['Users'],
    }),

    // GET USER BY ID
    getUser: builder.query({
      query: ({ id }: { id: UUID }) => `/users/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Users', id }],
    }),
  }),
});

export const { useLazyFetchUsersQuery, useLazyGetUserQuery, useFetchUsersQuery } = usersQueriesApiSlice;
