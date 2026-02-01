import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
} from '@/types/organization.type';

export const organizationMutationApiSlice = createApi({
  reducerPath: 'organizationMutationApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // CREATE ORGANIZATION (B2B Registration)
    createOrganization: builder.mutation<
      CreateOrganizationResponse,
      CreateOrganizationPayload
    >({
      query: (data) => ({
        url: '/organizations/register',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useCreateOrganizationMutation } = organizationMutationApiSlice;
