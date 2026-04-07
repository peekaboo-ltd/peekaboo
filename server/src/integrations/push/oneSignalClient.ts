import * as OneSignal from '@onesignal/node-onesignal';
import logger from '../../helpers/logger.helper';

function trimEnv(value: string | undefined): string {
  return (value ?? '').trim();
}

function isTruthyEnvFlag(value: string | undefined): boolean {
  return ['1', 'true', 'yes'].includes(String(value ?? '').trim().toLowerCase());
}

function appIdFingerprint(appId: string): string {
  if (appId.length <= 8) return '(too_short)';
  return `${appId.slice(0, 4)}…${appId.slice(-4)}`;
}

/** Logical channel keys from push call sites → OneSignal dashboard Android channel UUIDs */
const ANDROID_CHANNEL_ENV_BY_SLUG: Record<string, string> = {
  assignments: 'ONESIGNAL_ANDROID_CHANNEL_ASSIGNMENTS',
  assignments_urgent: 'ONESIGNAL_ANDROID_CHANNEL_ASSIGNMENTS_URGENT',
};

function resolveAndroidChannelId(slug?: string): string | undefined {
  if (!slug) return undefined;
  const envKey = ANDROID_CHANNEL_ENV_BY_SLUG[slug];
  if (!envKey) return undefined;
  const v = trimEnv(process.env[envKey]);
  return v || undefined;
}

async function resolveApiExceptionBody(body: unknown): Promise<unknown> {
  if (
    body &&
    typeof (body as { text?: () => Promise<string> }).text === 'function'
  ) {
    try {
      const text = await (body as { text: () => Promise<string> }).text();
      return text.length ? text : '(empty)';
    } catch {
      return '(could not read response body)';
    }
  }
  return body;
}

function formatOneSignalError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { detail: String(error) };
}

export class OneSignalClient {
  private readonly client: OneSignal.DefaultApi;
  private readonly appId: string;
  private readonly restApiKey: string;
  private readonly pushDisabled: boolean;
  private warnedMissingConfig = false;
  private warnedPushDisabled = false;

  constructor() {
    this.appId = trimEnv(process.env.ONESIGNAL_APP_ID);
    this.restApiKey = trimEnv(process.env.ONESIGNAL_REST_API_KEY);
    this.pushDisabled = isTruthyEnvFlag(process.env.PUSH_NOTIFICATIONS_DISABLED);

    const configuration = OneSignal.createConfiguration({
      restApiKey: this.restApiKey,
    });

    this.client = new OneSignal.DefaultApi(configuration);
  }

  private isConfigured(): boolean {
    return Boolean(this.appId && this.restApiKey);
  }

  /**
   * @returns true if OneSignal accepted the notification; false if skipped (no users, disabled, or missing config).
   */
  async sendNotification(params: {
    userIds: string[];
    title: string;
    body: string;
    data?: Record<string, string | undefined>;
    channelId?: string;
  }): Promise<boolean> {
    if (!params.userIds.length) {
      return false;
    }

    if (this.pushDisabled) {
      if (!this.warnedPushDisabled) {
        this.warnedPushDisabled = true;
        logger.warning(
          '[push/onesignal] Skipping notification: PUSH_NOTIFICATIONS_DISABLED is set'
        );
      }
      return false;
    }

    if (!this.isConfigured()) {
      if (!this.warnedMissingConfig) {
        this.warnedMissingConfig = true;
        const hasAppId = Boolean(this.appId);
        const hasKey = Boolean(this.restApiKey);
        logger.error(
          '[push/onesignal] Missing OneSignal configuration: set ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY (REST API Key from the same app as the App ID). Mobile EXPO_PUBLIC_ONESIGNAL_APP_ID must match ONESIGNAL_APP_ID.',
          { hasAppId, hasKey }
        );
      }
      return false;
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(
        `[push/onesignal] Using app id fingerprint ${appIdFingerprint(this.appId)}`
      );
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

    const androidChannelId = resolveAndroidChannelId(params.channelId);
    if (androidChannelId) {
      notification.android_channel_id = androidChannelId;
    }

    try {
      const response = await this.client.createNotification(notification);
      logger.info(
        `[push/onesignal] Notification sent to ${params.userIds.length} user(s), id: ${response.id}`
      );
      return true;
    } catch (error) {
      if (error instanceof OneSignal.ApiException) {
        const resolvedBody = await resolveApiExceptionBody(error.body);
        logger.error('[push/onesignal] OneSignal API error:', {
          httpCode: error.code,
          sdkMessage: error.message,
          responseBody: resolvedBody,
          cfRay: error.headers?.['cf-ray'],
        });
      } else {
        logger.error(
          '[push/onesignal] Failed to send notification:',
          formatOneSignalError(error)
        );
      }
      throw error;
    }
  }
}
