import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { UUID } from '../../types';
import { KpayCurrency, KpayPaymentStatus } from '../../types/kpay.types';
import {
  UrubutoChannelName,
  UrubutoConfig,
  UrubutoInitiatePaymentRequest,
  UrubutoInitiatePaymentResponse,
  UrubutoPaymentResult,
  UrubutoTransactionStatus,
  UrubutoWebhookAuthRequest,
} from '../../types/urubuto.types';

export class UrubutoService {
  private readonly client: AxiosInstance;
  private readonly config: UrubutoConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.URUBUTO_BASE_URL || 'https://staging.urubutopay.rw',
      apiKey: process.env.URUBUTO_API_KEY || '',
      merchantCode: process.env.URUBUTO_MERCHANT_CODE || '',
      serviceCode: process.env.URUBUTO_SERVICE_CODE || '',
      webhookUsername: process.env.URUBUTO_WEBHOOK_USERNAME || '',
      webhookPassword: process.env.URUBUTO_WEBHOOK_PASSWORD || '',
      webhookJwtSecret:
        process.env.URUBUTO_WEBHOOK_JWT_SECRET ||
        process.env.JWT_SECRET ||
        'peekaboo',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.config.apiKey,
      },
      timeout: 30000,
    });
  }

  public getMerchantCode(): string {
    return this.config.merchantCode;
  }

  public getServiceCode(): string {
    return this.config.serviceCode;
  }

  public timestamp(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  public authenticateWebhook(request: UrubutoWebhookAuthRequest): {
    success: boolean;
    token?: string;
  } {
    const hasCredentials =
      Boolean(this.config.webhookUsername) &&
      Boolean(this.config.webhookPassword);

    if (
      !hasCredentials ||
      request.user_name !== this.config.webhookUsername ||
      request.password !== this.config.webhookPassword
    ) {
      return { success: false };
    }

    const token = jwt.sign(
      {
        sub: 'urubuto-webhooks',
        iss: 'peekaboo',
      },
      this.config.webhookJwtSecret,
      { expiresIn: '24h' },
    );

    return { success: true, token: `Bearer ${token}` };
  }

  public verifyWebhookToken(authorization?: string): boolean {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return false;

    try {
      const payload = jwt.verify(token, this.config.webhookJwtSecret) as {
        sub?: string;
      };
      return payload.sub === 'urubuto-webhooks';
    } catch {
      return false;
    }
  }

  public mapStatusToInternal(
    status?: UrubutoTransactionStatus | string,
  ): KpayPaymentStatus {
    switch (status) {
      case UrubutoTransactionStatus.VALID:
        return KpayPaymentStatus.SUCCESSFUL;
      case UrubutoTransactionStatus.FAILED:
      case UrubutoTransactionStatus.CANCELED:
        return KpayPaymentStatus.FAILED;
      case UrubutoTransactionStatus.INITIATED:
      case UrubutoTransactionStatus.PENDING:
      case UrubutoTransactionStatus.PENDING_SETTLEMENT:
      default:
        return KpayPaymentStatus.PENDING;
    }
  }

  public normalizeChannelName(channelName?: string): UrubutoChannelName {
    if (channelName === UrubutoChannelName.AIRTEL_MONEY) {
      return UrubutoChannelName.AIRTEL_MONEY;
    }

    if (channelName === UrubutoChannelName.CARD) {
      return UrubutoChannelName.CARD;
    }

    return UrubutoChannelName.MOMO;
  }

  async initiatePayment(request: {
    amount: number;
    currency: KpayCurrency;
    customerEmail?: string;
    customerName: string;
    customerPhone?: string;
    refId: UUID;
    payerCode: string;
    channelName?: string;
    redirectUrl?: string;
  }): Promise<UrubutoPaymentResult> {
    try {
      if (
        !this.config.apiKey ||
        !this.config.merchantCode ||
        !this.config.serviceCode
      ) {
        return {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'UrubutoPay configuration is incomplete.',
          },
        };
      }

      const channelName = this.normalizeChannelName(request.channelName);
      const payload: UrubutoInitiatePaymentRequest = {
        amount: request.amount,
        channel_name: channelName,
        merchant_code: this.config.merchantCode,
        payer_code: request.payerCode,
        payer_names: request.customerName,
        phone_number: request.customerPhone?.replace(/[\s+]/g, '') || '',
        service_code: this.config.serviceCode,
        transaction_id: request.refId,
        payer_email: request.customerEmail,
        ...(channelName === UrubutoChannelName.CARD && request.redirectUrl
          ? { redirection_url: request.redirectUrl }
          : {}),
      };

      const response = await this.client.post<UrubutoInitiatePaymentResponse>(
        '/api/v2/payment/initiate',
        payload,
      );

      const data = response.data.data;
      const status = this.mapStatusToInternal(data?.transaction_status);
      const urubutoReference =
        data?.internal_transaction_ref_number || request.refId;

      return {
        success: response.data.status === 200 || response.status === 200,
        data: {
          transactionId: urubutoReference,
          paymentUrl: response.data.card_processing_url,
          reference: data?.external_transaction_ref_number || request.refId,
          amount: request.amount,
          currency: data?.currency || request.currency || KpayCurrency.RWF,
          status,
          message: response.data.message,
          metadata: {
            provider: 'URUBUTO',
            payerCode: request.payerCode,
            serviceCode: this.config.serviceCode,
            channelName,
            urubutoInternalTransactionRef:
              data?.internal_transaction_ref_number,
            cardProcessingUrl: response.data.card_processing_url,
            urlValidity: response.data.url_validity,
            initiationResponse: response.data,
          },
        },
      };
    } catch (error: any) {
      console.error(
        'UrubutoPay payment initiation error:',
        error.response?.data || error.message,
      );

      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'URUBUTO_ERROR',
          message:
            error.response?.data?.message ||
            error.message ||
            'UrubutoPay payment initiation failed.',
        },
      };
    }
  }
}
