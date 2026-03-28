import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { BusinessPlan, CreateBusinessPlanPayload, UpdateBusinessPlanPayload } from '@/types/businessPlan.type';

export const businessPlanMutationsApiSlice = createApi({
  reducerPath: 'businessPlanMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    createBusinessPlan: builder.mutation<{ message: string; data: BusinessPlan }, CreateBusinessPlanPayload>({
      query: (data) => ({
        url: '/business-plans',
        method: 'POST',
        body: data,
      }),
    }),

    updateBusinessPlan: builder.mutation<{ message: string; data: BusinessPlan }, { id: string; data: UpdateBusinessPlanPayload }>({
      query: ({ id, data }) => ({
        url: `/business-plans/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deactivateBusinessPlan: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/business-plans/${id}`,
        method: 'DELETE',
      }),
    }),

    restoreBusinessPlan: builder.mutation<{ message: string; data: BusinessPlan }, string>({
      query: (id) => ({
        url: `/business-plans/${id}/restore`,
        method: 'POST',
      }),
    }),

    permanentlyDeleteBusinessPlan: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/business-plans/${id}/permanent`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateBusinessPlanMutation,
  useUpdateBusinessPlanMutation,
  useDeactivateBusinessPlanMutation,
  useRestoreBusinessPlanMutation,
  usePermanentlyDeleteBusinessPlanMutation,
} = businessPlanMutationsApiSlice;
