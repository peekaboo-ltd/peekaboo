import apiClient from './client';
import { User, UserLocation } from '../../types';

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UpdateCurrentLocationResponse extends ApiResponse<UserLocation> {}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export const usersAPI = {
  updateCurrentLocation: async (
    location: Pick<UserLocation, 'latitude' | 'longitude'>
  ): Promise<UserLocation> => {
    const response = await apiClient.patch<UpdateCurrentLocationResponse>(
      `/users/me/current-location`,
      location
    );

    return response.data.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/users/${id}`,
      payload
    );
    return response.data.data;
  },
};
