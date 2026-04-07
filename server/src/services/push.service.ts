import { SendPushDto } from '../types/push.types';
import { PushNotificationType } from '../constants/push.constants';
import { OneSignalClient } from '../integrations/push/oneSignalClient';
import logger from '../helpers/logger.helper';

export class PushService {
  private readonly oneSignalClient: OneSignalClient;

  constructor() {
    this.oneSignalClient = new OneSignalClient();
  }

  async sendPushNotification(payload: SendPushDto): Promise<number> {
    if (!payload.userIds.length) {
      return 0;
    }

    try {
      await this.oneSignalClient.sendNotification({
        userIds: payload.userIds,
        title: payload.title,
        body: payload.body,
        data: {
          type: payload.type || PushNotificationType.GENERAL,
          ...payload.data,
        },
        channelId: payload.channelId,
      });

      return payload.userIds.length;
    } catch (error) {
      logger.error('[push] Failed to send push notification:', error);
      return 0;
    }
  }
}

export const pushService = new PushService();
