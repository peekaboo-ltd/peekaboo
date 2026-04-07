import apiClient from './client';
import axios from 'axios';
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

export interface UpdateMyStatusWithProofPayload {
  status: UserStatus;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  capturedAt?: string;
  proofImageUri: string;
  overlayTimestamp?: string;
  overlayLocationLabel?: string;
  overlayAppliedOnClient?: boolean;
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

  updateMyStatusWithProof: async (payload: UpdateMyStatusWithProofPayload): Promise<User> => {
    const createProofFormData = (): FormData => {
      const formData: FormData = new FormData();

      formData.append('status', payload.status);
      formData.append('latitude', String(payload.latitude));
      formData.append('longitude', String(payload.longitude));

      if (payload.locationLabel) {
        formData.append('locationLabel', payload.locationLabel);
      }

      if (payload.capturedAt) {
        formData.append('capturedAt', payload.capturedAt);
      }
      if (payload.overlayTimestamp) {
        formData.append('overlayTimestamp', payload.overlayTimestamp);
      }
      if (payload.overlayLocationLabel) {
        formData.append('overlayLocationLabel', payload.overlayLocationLabel);
      }
      if (payload.overlayAppliedOnClient !== undefined) {
        formData.append('overlayAppliedOnClient', String(payload.overlayAppliedOnClient));
      }

      // React Native file object typing is not available in DOM lib.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proofImage: any = {
        uri: payload.proofImageUri,
        name: `status-proof-${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      formData.append('proofImage', proofImage);
      return formData;
    };

    try {
      const response = await apiClient.patch<ApiResponse<User>>(
        `/users/me/status-with-proof`,
        createProofFormData()
      );

      return response.data.data;
    } catch (error) {
      const canRetry =
        axios.isAxiosError(error) &&
        (!error.response || (error.response.status >= 500 && error.response.status < 600));

      if (!canRetry) {
        throw error;
      }

      const retryResponse = await apiClient.patch<ApiResponse<User>>(
        `/users/me/status-with-proof`,
        createProofFormData()
      );
      return retryResponse.data.data;
    }
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
