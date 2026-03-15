import { In, IsNull, Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { PushSubscription } from '../entities/pushSubscription.entity';
import {
  PushNotificationType,
  PushReceiptStatus,
} from '../constants/push.constants';
import { RegisterPushTokenDto, SendPushDto } from '../types/push.types';
import { ValidationError } from '../helpers/errors.helper';
import { ExpoPushClient } from '../integrations/push/expoPushClient';
import logger from '../helpers/logger.helper';
import { UUID } from '../types';

interface PendingReceipt {
  ticketId: string;
  expoPushToken: string;
}

export class PushService {
  private readonly pushSubscriptionRepository: Repository<PushSubscription>;
  private readonly expoPushClient: ExpoPushClient;
  private readonly pendingReceipts: PendingReceipt[] = [];

  constructor() {
    this.pushSubscriptionRepository = AppDataSource.getRepository(PushSubscription);
    this.expoPushClient = new ExpoPushClient();
  }

  async registerPushToken(userId: UUID, payload: RegisterPushTokenDto) {
    if (!this.expoPushClient.isExpoPushToken(payload.expoPushToken)) {
      throw new ValidationError('Invalid Expo push token');
    }

    const existing = await this.pushSubscriptionRepository.findOne({
      where: { expoPushToken: payload.expoPushToken },
    });

    const subscription = this.pushSubscriptionRepository.create({
      ...(existing || {}),
      ...payload,
      userId,
      notificationsEnabled: payload.notificationsEnabled ?? true,
      invalidatedAt: undefined,
      lastSeenAt: new Date(),
    });

    await this.pushSubscriptionRepository.save(subscription);

    return subscription;
  }

  async disablePushToken(userId: UUID, token: string): Promise<void> {
    const subscription = await this.pushSubscriptionRepository.findOne({
      where: { expoPushToken: token, userId },
    });

    if (!subscription) {
      return;
    }

    subscription.notificationsEnabled = false;
    subscription.invalidatedAt = new Date();
    subscription.lastSeenAt = new Date();

    await this.pushSubscriptionRepository.save(subscription);
  }

  async sendPushNotification(payload: SendPushDto): Promise<number> {
    if (!payload.userIds.length) {
      return 0;
    }

    const subscriptions = await this.pushSubscriptionRepository.find({
      where: {
        userId: In(payload.userIds),
        notificationsEnabled: true,
        invalidatedAt: IsNull(),
      },
    });

    if (!subscriptions.length) {
      return 0;
    }

    const messages = subscriptions
      .map((subscription) => {
        if (!this.expoPushClient.isExpoPushToken(subscription.expoPushToken)) {
          return null;
        }

        return {
          to: subscription.expoPushToken,
          sound: 'default' as const,
          title: payload.title,
          body: payload.body,
          channelId: payload.channelId,
          data: {
            type: payload.type || PushNotificationType.GENERAL,
            ...payload.data,
          },
        };
      })
      .filter((message): message is NonNullable<typeof message> => Boolean(message));

    const chunks = this.expoPushClient.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const tickets = await this.expoPushClient.sendPushNotificationsAsync(chunk);

      tickets.forEach((ticket, index) => {
        const targetToken = chunk[index]?.to;

        if (!targetToken) {
          return;
        }

        if (ticket.status === 'ok' && ticket.id) {
          this.pendingReceipts.push({
            ticketId: ticket.id,
            expoPushToken: targetToken,
          });
        }

        if (ticket.status === 'error') {
          logger.error(`Push ticket send error: ${ticket.message || 'Unknown error'}`);
        }
      });
    }

    return messages.length;
  }

  async processReceipts(): Promise<void> {
    if (!this.pendingReceipts.length) {
      return;
    }

    const receiptMap = new Map(this.pendingReceipts.map((item) => [item.ticketId, item.expoPushToken]));
    const receiptIds = [...receiptMap.keys()];
    const chunks = this.expoPushClient.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of chunks) {
      const receipts = await this.expoPushClient.getPushNotificationReceiptsAsync(chunk);

      for (const receiptId of chunk) {
        const receipt = receipts[receiptId];
        const expoPushToken = receiptMap.get(receiptId);

        if (!receipt || !expoPushToken) {
          continue;
        }

        const subscription = await this.pushSubscriptionRepository.findOne({
          where: { expoPushToken },
        });

        if (!subscription) {
          continue;
        }

        if (receipt.status === 'ok') {
          subscription.lastReceiptStatus = PushReceiptStatus.OK;
          subscription.lastReceiptError = undefined;
          subscription.lastSeenAt = new Date();

          await this.pushSubscriptionRepository.save(subscription);
          continue;
        }

        const receiptError = receipt.details?.error || receipt.message || 'Unknown receipt error';

        subscription.lastReceiptStatus = PushReceiptStatus.ERROR;
        subscription.lastReceiptError = receiptError;
        subscription.lastSeenAt = new Date();

        if (receipt.details?.error === 'DeviceNotRegistered') {
          subscription.notificationsEnabled = false;
          subscription.invalidatedAt = new Date();
        }

        await this.pushSubscriptionRepository.save(subscription);
      }
    }

    this.pendingReceipts.length = 0;
  }
}

export const pushService = new PushService();
