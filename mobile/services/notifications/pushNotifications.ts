import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

let currentPushToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  type?: 'assignment' | 'order' | 'general';
  assignmentId?: string;
  orderId?: string;
  [key: string]: string | undefined;
}

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    const token = tokenData.data;
    currentPushToken = token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1D546D',
      });

      await Notifications.setNotificationChannelAsync('assignments', {
        name: 'Assignments',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Notifications for new assignments',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1D546D',
      });

      await Notifications.setNotificationChannelAsync('assignments_urgent', {
        name: 'Urgent assignments',
        importance: Notifications.AndroidImportance.MAX,
        description: 'Urgent assignment notifications',
        vibrationPattern: [0, 250, 500, 250],
        lightColor: '#1D546D',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

export const getCurrentPushToken = (): string | null => currentPushToken;

export const getPushDeviceMetadata = () => ({
  platform: Platform.OS as 'ios' | 'android',
  appVersion: Constants.expoConfig?.version,
  deviceName: Device.deviceName || undefined,
  osVersion: Device.osVersion || undefined,
  notificationsEnabled: true,
});

export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseListener = (
  callback?: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as PushNotificationData;

    if (data.assignmentId) {
      router.push(`/assignment/${data.assignmentId}`);
    } else if (data.type === 'assignment') {
      router.push('/(tabs)/assignments');
    }

    callback?.(response);
  });
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: PushNotificationData,
  seconds: number = 1
): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as Record<string, unknown>,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

export const clearBadgeCount = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0);
};
