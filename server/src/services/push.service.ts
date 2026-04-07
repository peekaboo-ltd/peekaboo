import { ApiException } from '@onesignal/node-onesignal';
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
      const sent = await this.oneSignalClient.sendNotification({
        userIds: payload.userIds,
        title: payload.title,
        body: payload.body,
        data: {
          type: payload.type || PushNotificationType.GENERAL,
          ...payload.data,
        },
        channelId: payload.channelId,
      });

      if (sent) {
        logger.success(
          `[push] Push notification sent to ${payload.userIds.length} user(s)`
        );
        return payload.userIds.length;
      }

      return 0;
    } catch (error: any) {
      logger.error(`[push] Error sending push notification: ${error?.message || error}`);
      // Attach the error to a custom error and throw, so the controller can return it to the user
      const errorToThrow = new Error(
        `Failed to send push notification: ${error?.message || error}`
      );
      (errorToThrow as any).originalError = error;
      throw errorToThrow;
    }
  }
}

export const pushService = new PushService();
