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
  UrubutoVerifyTransactionStatusApiResponse,
  UrubutoVerifyTransactionStatusResult,
  UrubutoWebhookAuthRequest,
} from '../../types/urubuto.types';
import { buildUrubutoConfig } from './urubuto.config';
import logger from '../../helpers/logger.helper';

export function mapUrubutoInitiateErrorMessage(rawMessage?: string): string {
  const message = rawMessage || 'UrubutoPay payment initiation failed.';
  const lower = message.toLowerCase();

  if (
    lower.includes('merchant') &&
    (lower.includes('invalid') ||
      lower.includes('not found') ||
      lower.includes('no active'))
  ) {
    return `${message} Verify URUBUTO_MERCHANT_CODE matches your active UrubutoPay merchant account and environment (staging vs production).`;
  }

  if (
    lower.includes('payer code') ||
    lower.includes('payer_code') ||
    (lower.includes('invalid') && lower.includes('payer'))
  ) {
    return `${message} Ensure the order reference ID is used as payer_code and the payer validation webhook is registered and reachable.`;
  }

  if (lower.includes('service')) {
    return `${message} Verify URUBUTO_SERVICE_CODE is registered and linked to your merchant in UrubutoPay.`;
  }

  if (lower.includes('redirection url')) {
    return `${message} CARD payments require a valid redirection_url.`;
  }

  return message;
}

export class UrubutoService {
  private readonly client: AxiosInstance;
  private readonly config: UrubutoConfig;

  constructor(config: UrubutoConfig = buildUrubutoConfig()) {
    this.config = config;

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.config.apiKey,
      },
      timeout: 30000,
    });
  }

  public getConfig(): Readonly<UrubutoConfig> {
    return this.config;
  }

  public getMerchantCode(): string {
    return this.config.merchantCode;
  }

  public getServiceCode(): string {
    return this.config.serviceCode;
  }

  public getHostedCheckoutUrl(payerCode: string): string {
    const merchantCode = encodeURIComponent(this.config.merchantCode);
    const encodedPayerCode = encodeURIComponent(payerCode);

    return `${this.config.checkoutBaseUrl}/pay-now/initiate/?mhcd=${merchantCode}&pycd=${encodedPayerCode}`;
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

  async verifyTransactionStatus(
    transactionId: string,
  ): Promise<UrubutoVerifyTransactionStatusResult> {
    if (
      !this.config.apiKey ||
      !this.config.merchantCode ||
      !transactionId
    ) {
      return {
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'UrubutoPay configuration or transaction ID is incomplete.',
        },
      };
    }

    try {
      const response =
        await this.client.post<UrubutoVerifyTransactionStatusApiResponse>(
          '/api/v2/payment/transaction/status',
          {
            merchant_code: this.config.merchantCode,
            transaction_id: transactionId,
          },
        );

      const isSuccess =
        response.data.status === 200 || response.status === 200;

      return {
        success: isSuccess,
        data: response.data.data,
        message: response.data.message,
        timestamp: response.data.timestamp,
        error: isSuccess
          ? undefined
          : {
              code: String(response.data.status || response.status),
              message:
                response.data.message ||
                'UrubutoPay transaction status lookup failed.',
            },
      };
    } catch (error: any) {
      logger.error('UrubutoPay transaction status error', {
        transactionId,
        merchantCode: this.config.merchantCode,
        response: error.response?.data,
        message: error.message,
      });

      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'URUBUTO_ERROR',
          message: mapUrubutoInitiateErrorMessage(
            error.response?.data?.message || error.message,
          ),
        },
      };
    }
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
    const channelName = this.normalizeChannelName(request.channelName);

    const logContext = {
      merchant_code: this.config.merchantCode,
      service_code: this.config.serviceCode,
      payer_code: request.payerCode,
      channel_name: channelName,
      amount: request.amount,
      transaction_id: request.refId,
    };

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
            message:
              'UrubutoPay configuration is incomplete. Check URUBUTO_API_KEY, URUBUTO_MERCHANT_CODE, and URUBUTO_SERVICE_CODE.',
          },
        };
      }

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
      const cardProcessingUrl = response.data.card_processing_url;
      const hostedCheckoutUrl =
        channelName !== UrubutoChannelName.CARD
          ? this.getHostedCheckoutUrl(request.payerCode)
          : undefined;
      const paymentUrl = cardProcessingUrl || hostedCheckoutUrl;
      const apiSuccess =
        response.data.status === 200 || response.status === 200;

      if (!apiSuccess) {
        const message = mapUrubutoInitiateErrorMessage(response.data.message);
        logger.error('UrubutoPay payment initiation rejected', {
          ...logContext,
          urubutoStatus: response.data.status,
          message: response.data.message,
        });

        return {
          success: false,
          error: {
            code: String(response.data.status || response.status),
            message,
          },
        };
      }

      return {
        success: true,
        data: {
          transactionId: urubutoReference,
          paymentUrl,
          reference: data?.external_transaction_ref_number || request.refId,
          amount: request.amount,
          currency: data?.currency || request.currency || KpayCurrency.RWF,
          status,
          message: response.data.message,
          metadata: {
            provider: 'URUBUTO',
            payerCode: request.payerCode,
            serviceCode: this.config.serviceCode,
            merchantCode: this.config.merchantCode,
            channelName,
            urubutoInternalTransactionRef:
              data?.internal_transaction_ref_number,
            cardProcessingUrl,
            hostedCheckoutUrl,
            urlValidity: response.data.url_validity,
            initiationResponse: response.data,
          },
        },
      };
    } catch (error: any) {
      const rawMessage =
        error.response?.data?.message ||
        error.message ||
        'UrubutoPay payment initiation failed.';

      logger.error('UrubutoPay payment initiation error', {
        ...logContext,
        httpStatus: error.response?.status,
        urubutoResponse: error.response?.data,
        message: rawMessage,
      });

      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'URUBUTO_ERROR',
          message: mapUrubutoInitiateErrorMessage(rawMessage),
        },
      };
    }
  }
}
