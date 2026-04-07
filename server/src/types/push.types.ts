import { PushNotificationType } from '../constants/push.constants';
import { UUID } from '.';

export interface SendPushDto {
  userIds: UUID[];
  title: string;
  body: string;
  type?: PushNotificationType;
  data?: Record<string, string | undefined>;
  channelId?: string;
}
