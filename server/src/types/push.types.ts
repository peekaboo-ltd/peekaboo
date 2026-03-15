import { PushNotificationType, PushPlatform } from '../constants/push.constants';
import { UUID } from '.';

export interface RegisterPushTokenDto {
  expoPushToken: string;
  platform: PushPlatform;
  appVersion?: string;
  deviceName?: string;
  osVersion?: string;
  notificationsEnabled?: boolean;
}

export interface SendPushDto {
  userIds: UUID[];
  title: string;
  body: string;
  type?: PushNotificationType;
  data?: Record<string, string | undefined>;
  channelId?: string;
}

export interface PushTicketRecord {
  ticketId: string;
  expoPushToken: string;
}
