import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const businessPlanQueriesApiSlice = createApi({
  reducerPath: 'businessPlanQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchBusinessPlans: builder.query({
      query: (params) => ({
        url: '/business-plans',
        params: { page: params?.page ?? 1, size: params?.size ?? 100 },
      }),
    }),

    fetchBusinessPlanById: builder.query({
      query: (id) => ({
        url: `/business-plans/${id}`,
      }),
    }),

    fetchBusinessPlanOrganizationCount: builder.query({
      query: (id) => ({
        url: `/business-plans/${id}/organization-count`,
      }),
    }),
  }),
});

export const {
  useFetchBusinessPlansQuery,
  useLazyFetchBusinessPlansQuery,
  useFetchBusinessPlanByIdQuery,
  useFetchBusinessPlanOrganizationCountQuery,
} = businessPlanQueriesApiSlice;
