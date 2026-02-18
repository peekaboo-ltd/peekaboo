import apiClient from './client';
import { UserLocation } from '../../types';

interface UpdateCurrentLocationResponse {
  message: string;
  data: UserLocation;
}

export const usersAPI = {
  updateCurrentLocation: async (
    location: Pick<UserLocation, 'latitude' | 'longitude'>
  ): Promise<UserLocation> => {
    const response = await apiClient.patch<UpdateCurrentLocationResponse>(
      '/users/current-location',
      location
    );

    return response.data.data;
  },
};
