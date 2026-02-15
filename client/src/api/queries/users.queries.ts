import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const usersQueriesApiSlice = createApi({
  reducerPath: 'usersQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchUsers: builder.query({
      query: ({
        page,
        size,
        search,
        roles,
        status,
        organizationId
      }: {
        page: number;
        size: number;
        search?: string;
        roles?: string[];
        status?: string;
        organizationId?: string;
      }) => {
        return {
          url: '/users',
          params: {
            search,
            page,
            size,
            roles: roles ? roles.join(',') : undefined,
            status,
            organizationId,
          },
        };
      },
    }),
    fetchUserById: builder.query({
      query: (id: string) => ({
        url: `/users/${id}`,
      }),
    }),
  }),
});

export const { useLazyFetchUsersQuery, useLazyFetchUserByIdQuery } =
  usersQueriesApiSlice;
