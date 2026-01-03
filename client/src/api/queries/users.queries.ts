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
      }: {
        page: number;
        size: number;
        search?: string;
        roles?: string[];
        status?: string;
      }) => {
        const params: Record<string, unknown> = { page, size };
        if (search) params.search = search;
        if (roles) params.roles = roles;
        if (status) params.status = status;

        return {
          url: '/users',
          params,
        };
      },
    }),
  }),
});

export const { useLazyFetchUsersQuery } = usersQueriesApiSlice;
