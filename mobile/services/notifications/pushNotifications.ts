import Constants from 'expo-constants';
import { router } from 'expo-router';

let initialized = false;

/** Cached native module; `undefined` = not tried yet, `null` = unavailable */
let oneSignalRuntime: OneSignalNative | null | undefined;

export interface PushNotificationData {
  type?: 'assignment' | 'order' | 'general';
  assignmentId?: string;
  orderId?: string;
  [key: string]: string | undefined;
}

type OneSignalNative = {
  initialize: (appId: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  Notifications: {
    requestPermission: (fallback: boolean) => Promise<boolean>;
    addEventListener: (event: string, handler: (event: unknown) => void) => void;
    removeEventListener: (event: string, handler: (event: unknown) => void) => void;
  };
};

function getOneSignal(): OneSignalNative | null {
  if (oneSignalRuntime === null) return null;
  if (oneSignalRuntime !== undefined) return oneSignalRuntime;

  if (Constants.executionEnvironment === 'storeClient') {
    if (__DEV__) {
      console.warn(
        '[peekaboo/push] OneSignal is not supported in Expo Go. Build a dev client (eas build --profile development) to use push.'
      );
    }
    oneSignalRuntime = null;
    return null;
  }

  try {
    const mod = require('react-native-onesignal') as { OneSignal: OneSignalNative };
    oneSignalRuntime = mod.OneSignal;
    return oneSignalRuntime;
  } catch (e) {
    if (__DEV__) {
      console.warn(
        '[peekaboo/push] OneSignal native module unavailable (Expo Go or rebuild dev client with native deps). Push disabled.',
        e
      );
    }
    oneSignalRuntime = null;
    return null;
  }
}

export const initializeOneSignal = (): void => {
  if (initialized) return;

  const OneSignal = getOneSignal();
  if (!OneSignal) return;

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
    try {
      const { OneSignal: OS, LogLevel } = require('react-native-onesignal') as {
        OneSignal: { Debug: { setLogLevel: (level: number) => void } };
        LogLevel: { Verbose: number };
      };
      OS.Debug.setLogLevel(LogLevel.Verbose);
    } catch {
      /* ignore if SDK shape differs */
    }
    console.log('[peekaboo/push] OneSignal initialized with app ID:', appId);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const OneSignal = getOneSignal();
  if (!OneSignal) return false;

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
  const OneSignal = getOneSignal();
  if (!OneSignal) return;

  if (!initialized) {
    initializeOneSignal();
  }
  if (!initialized) return;

  OneSignal.login(userId);

  if (__DEV__) {
    console.log('[peekaboo/push] OneSignal login called for user:', userId);
  }
};

export const logoutOneSignal = (): void => {
  const OneSignal = getOneSignal();
  if (!OneSignal) return;

  OneSignal.logout();

  if (__DEV__) {
    console.log('[peekaboo/push] OneSignal logout called');
  }
};

export const addNotificationClickListener = (
  callback?: (data: PushNotificationData) => void
): (() => void) => {
  const OneSignal = getOneSignal();
  if (!OneSignal) {
    return () => {};
  }

  const handler = (event: unknown) => {
    const e = event as {
      notification?: { additionalData?: Record<string, string | undefined> };
    };
    const data = (e.notification?.additionalData || {}) as PushNotificationData;

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
  const OneSignal = getOneSignal();
  if (!OneSignal) {
    return () => {};
  }

  const handler = (event: unknown) => {
    const e = event as {
      notification?: { additionalData?: Record<string, string | undefined> };
      getNotification?: () => { display: () => void };
    };
    const data = (e.notification?.additionalData || {}) as PushNotificationData;

    e.getNotification?.().display();

    callback?.(data);
  };

  OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler);

  return () => {
    OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handler);
  };
};
