import * as OneSignal from '@onesignal/node-onesignal';
import logger from '../../helpers/logger.helper';

export class OneSignalClient {
  private readonly client: OneSignal.DefaultApi;
  private readonly appId: string;

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID || '';

    const configuration = OneSignal.createConfiguration({
      restApiKey: process.env.ONESIGNAL_REST_API_KEY || '',
    });

    this.client = new OneSignal.DefaultApi(configuration);
  }

  async sendNotification(params: {
    userIds: string[];
    title: string;
    body: string;
    data?: Record<string, string | undefined>;
    channelId?: string;
  }): Promise<void> {
    if (!params.userIds.length) {
      return;
    }

    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.include_aliases = {
      external_id: params.userIds,
    };
    notification.target_channel = 'push';
    notification.headings = { en: params.title };
    notification.contents = { en: params.body };

    if (params.data) {
      notification.data = params.data;
    }

    if (params.channelId) {
      notification.android_channel_id = params.channelId;
    }

    try {
      const response = await this.client.createNotification(notification);
      logger.info(
        `[push/onesignal] Notification sent to ${params.userIds.length} user(s), id: ${response.id}`
      );
    } catch (error) {
      logger.error('[push/onesignal] Failed to send notification:', error);
      throw error;
    }
  }
}
