import apiClient from './client';
import { User, UserLocation } from '../../types';

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UpdateCurrentLocationResponse {
  message: string;
  data: UserLocation;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
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
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', payload);
    return response.data.data;
  },
};
