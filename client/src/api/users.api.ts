import { createApi } from '@reduxjs/toolkit/query/react';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  userRoles: Array<{ role: { name: string } }>;
  createdAt: string;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: `/users?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    getUserById: builder.query<{ data: User }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
    }),
    updateUser: builder.mutation<{ data: User }, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery, useUpdateUserMutation, useDeleteUserMutation } = usersApi;
