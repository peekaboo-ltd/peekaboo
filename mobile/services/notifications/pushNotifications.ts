import { OneSignal, NotificationClickEvent, NotificationWillDisplayEvent } from 'react-native-onesignal';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

let initialized = false;

export interface PushNotificationData {
  type?: 'assignment' | 'order' | 'general';
  assignmentId?: string;
  orderId?: string;
  [key: string]: string | undefined;
}

export const initializeOneSignal = (): void => {
  if (initialized) return;

  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.error(
      '[peekaboo/push] OneSignal App ID missing: set EXPO_PUBLIC_ONESIGNAL_APP_ID in env'
    );
    return;
  }

  OneSignal.initialize(appId);
  initialized = true;

  if (__DEV__) {
    console.log('[peekaboo/push] OneSignal initialized with app ID:', appId);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('[peekaboo/push] Push notifications only work on physical devices');
    return false;
  }

  try {
    const granted = await OneSignal.Notifications.requestPermission(true);

    if (!granted) {
      console.log('[peekaboo/push] Notification permission not granted');
    }

    return granted;
  } catch (error) {
    console.error('[peekaboo/push] Error requesting notification permission:', error);
    return false;
  }
};

export const loginOneSignal = (userId: string): void => {
  if (!initialized) {
    initializeOneSignal();
  }

  OneSignal.login(userId);

  if (__DEV__) {
    console.log('[peekaboo/push] OneSignal login called for user:', userId);
  }
};

export const logoutOneSignal = (): void => {
  OneSignal.logout();

  if (__DEV__) {
    console.log('[peekaboo/push] OneSignal logout called');
  }
};

export const addNotificationClickListener = (
  callback?: (data: PushNotificationData) => void
): (() => void) => {
  const handler = (event: NotificationClickEvent) => {
    const data = (event.notification.additionalData || {}) as PushNotificationData;

    if (data.assignmentId) {
      router.push(`/assignment/${data.assignmentId}`);
    } else if (data.type === 'assignment') {
      router.push('/(tabs)/assignments');
    }

    callback?.(data);
  };

  OneSignal.Notifications.addEventListener('click', handler);

  return () => {
    OneSignal.Notifications.removeEventListener('click', handler);
  };
};

export const addNotificationForegroundListener = (
  callback?: (data: PushNotificationData) => void
): (() => void) => {
  const handler = (event: NotificationWillDisplayEvent) => {
    const data = (event.notification.additionalData || {}) as PushNotificationData;

    // Allow the notification to display
    event.getNotification().display();

    callback?.(data);
  };

  OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler);

  return () => {
    OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handler);
  };
};
