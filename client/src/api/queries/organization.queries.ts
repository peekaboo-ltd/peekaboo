import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { Organization } from '@/types/organization.type';

export const organizationQueriesApiSlice = createApi({
  reducerPath: 'organizationQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchMyOrganization: builder.query<{ message: string; data: Organization }, void>({
      query: () => ({
        url: '/organizations/me',
      }),
    }),
  }),
});

export const { useLazyFetchMyOrganizationQuery, useFetchMyOrganizationQuery } =
  organizationQueriesApiSlice;
