export enum PushPlatform {
  IOS = 'ios',
  ANDROID = 'android',
}

/** @deprecated OneSignal handles receipt tracking. Kept for existing DB column compatibility. */
export enum PushReceiptStatus {
  OK = 'ok',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export enum PushNotificationType {
  ASSIGNMENT = 'assignment',
  ORDER = 'order',
  GENERAL = 'general',
}
