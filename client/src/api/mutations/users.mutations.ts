import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import { RoleTypes } from '@/types/auth.type';
import { UserStatus } from '@/constants/user.constants';
import { UUID } from '@/types';

export interface CreateUserRequest {
  phoneNumber: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  status?: UserStatus;
  nationality?: string;
  dateOfBirth?: string;
  roles?: RoleTypes[];
  organizationId?: UUID;
}

export interface UpdateUserRequest {
  id: UUID;
  phoneNumber?: string;
  name?: string;
  email?: string;
  status?: UserStatus;
  nationality?: string;
  dateOfBirth?: string;
  profilePhotoUrl?: string | null;
}

export interface UpdateUserStatusRequest {
  id: UUID;
  status: UserStatus;
}

export const usersMutationsApiSlice = createApi({
  reducerPath: 'usersMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (data: CreateUserRequest) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
    }),

    updateUser: builder.mutation({
      query: ({ id, ...data }: UpdateUserRequest) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, status }: UpdateUserStatusRequest) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),

    deleteUser: builder.mutation({
      query: (id: UUID) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
    }),

    resetUserPassword: builder.mutation({
      query: (id: UUID) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
      }),
    }),

    uploadUserAvatar: builder.mutation({
      query: ({ userId, file }: { userId: UUID; file: File }) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: `/users/${userId}/avatar`,
          method: 'POST',
          body: formData,
        };
      },
    }),

    removeUserAvatar: builder.mutation({
      query: (userId: UUID) => ({
        url: `/users/${userId}/avatar`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useUploadUserAvatarMutation,
  useRemoveUserAvatarMutation,
} = usersMutationsApiSlice;
