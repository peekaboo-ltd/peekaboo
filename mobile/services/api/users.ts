import apiClient from './client';
import { User, UserLocation, UserStatus } from '../../types';

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
  status?: UserStatus;
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

  uploadAvatar: async (id: string, fileUri: string): Promise<User> => {
    const formData: FormData = new FormData();

    // The React Native file object type isn't in the DOM lib,
    // so we deliberately bypass the strict typing here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = {
      uri: fileUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    };

    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<User>>(
      `/users/${id}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  removeAvatar: async (id: string): Promise<User> => {
    const response = await apiClient.delete<ApiResponse<User>>(
      `/users/${id}/avatar`
    );
    return response.data.data;
  },
};
