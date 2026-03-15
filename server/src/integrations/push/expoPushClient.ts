interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound?: 'default';
  data?: Record<string, string | undefined>;
  channelId?: string;
}

interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  details?: {
    error?: string;
  };
  message?: string;
}

export interface ExpoPushReceipt {
  status: 'ok' | 'error';
  details?: {
    error?: string;
  };
  message?: string;
}

export class ExpoPushClient {
  private readonly endpoint = 'https://exp.host/--/api/v2/push';

  isExpoPushToken(token: string): boolean {
    return /^ExponentPushToken\[[\w-]+\]$/.test(token);
  }

  chunkPushNotifications(messages: ExpoPushMessage[]): ExpoPushMessage[][] {
    const chunkSize = 100;
    const chunks: ExpoPushMessage[][] = [];

    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }

    return chunks;
  }

  async sendPushNotificationsAsync(
    messages: ExpoPushMessage[]
  ): Promise<ExpoPushTicket[]> {
    const response = await fetch(`${this.endpoint}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const payload = (await response.json()) as {
      data?: ExpoPushTicket[];
      errors?: unknown[];
    };

    if (!response.ok || payload.errors?.length) {
      throw new Error('Failed to send Expo push notifications');
    }

    return payload.data || [];
  }

  chunkPushNotificationReceiptIds(receiptIds: string[]): string[][] {
    const chunkSize = 300;
    const chunks: string[][] = [];

    for (let i = 0; i < receiptIds.length; i += chunkSize) {
      chunks.push(receiptIds.slice(i, i + chunkSize));
    }

    return chunks;
  }

  async getPushNotificationReceiptsAsync(receiptIds: string[]) {
    const response = await fetch(`${this.endpoint}/getReceipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: receiptIds }),
    });

    const payload = (await response.json()) as {
      data?: Record<string, ExpoPushReceipt>;
      errors?: unknown[];
    };

    if (!response.ok || payload.errors?.length) {
      throw new Error('Failed to fetch Expo push receipts');
    }

    return payload.data || {};
  }
}
