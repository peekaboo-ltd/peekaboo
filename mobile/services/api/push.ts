import apiClient from './client';

export interface RegisterPushSubscriptionPayload {
  expoPushToken: string;
  platform: 'ios' | 'android';
  appVersion?: string;
  deviceName?: string;
  osVersion?: string;
  notificationsEnabled?: boolean;
}

export const pushAPI = {
  registerPushSubscription: async (
    payload: RegisterPushSubscriptionPayload
  ): Promise<void> => {
    await apiClient.post('/push/subscriptions', payload);
  },

  disablePushSubscription: async (token: string): Promise<void> => {
    await apiClient.delete(`/push/subscriptions/${encodeURIComponent(token)}`);
  },
};
