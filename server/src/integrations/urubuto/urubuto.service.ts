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
import {
  buildUrubutoConfig,
  describeUrubutoEnvironment,
  urubutoCredentialFingerprint,
} from './urubuto.config';
import logger from '../../helpers/logger.helper';

export function isValidUrubutoRedirectUrl(redirectUrl?: string): boolean {
  if (!redirectUrl) return false;

  try {
    const parsedUrl = new URL(redirectUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

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

function isUrubutoServiceCodeError(rawMessage?: string): boolean {
  const lower = (rawMessage || '').toLowerCase();
  return lower.includes('service code') || lower.includes('service_code');
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
      logger.error('UrubutoPay webhook authentication failed', {
        request,
        config: this.config,
      });

      return { success: false, token: undefined };
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
      logger.info('UrubutoPay webhook token verified', {
        payload,
        config: this.config,
      });
      return payload.sub === 'urubuto-webhooks';
    } catch {
      logger.error('UrubutoPay webhook token verification failed', {
        token,
        config: this.config,
      });
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

        logger.info('UrubutoPay transaction status response', {
          response,
          config: this.config,
        });

      const isSuccess =
        response.data.status === 200 || response.status === 200;

      logger.info('UrubutoPay transaction status result', {
        isSuccess,
        data: response.data.data,
        message: response.data.message,
        timestamp: response.data.timestamp,
      });

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
    const apiEnvironment = describeUrubutoEnvironment(this.config.baseUrl);
    const merchantCodeFingerprint = urubutoCredentialFingerprint(
      this.config.merchantCode,
    );
    const serviceCodeFingerprint = urubutoCredentialFingerprint(
      this.config.serviceCode,
    );

    const logContext = {
      api_environment: apiEnvironment,
      merchant_code_fingerprint: merchantCodeFingerprint,
      service_code_fingerprint: serviceCodeFingerprint,
      service_code_source: 'URUBUTO_SERVICE_CODE',
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
        logger.error('UrubutoPay payment initiation rejected', {
          ...logContext,
          redirectUrl: request.redirectUrl,
        });

        return {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message:
              'UrubutoPay configuration is incomplete. Check URUBUTO_API_KEY, URUBUTO_MERCHANT_CODE, and URUBUTO_SERVICE_CODE.',
          },
        };
      }

      if (
        channelName === UrubutoChannelName.CARD &&
        !isValidUrubutoRedirectUrl(request.redirectUrl)
      ) {
        return {
          success: false,
          error: {
            code: 'INVALID_REDIRECTION_URL',
            message: 'CARD payments require a valid redirection_url.',
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
        ...(channelName === UrubutoChannelName.CARD
          ? { redirection_url: request.redirectUrl }
          : {}),
      };

      logger.info('UrubutoPay payment initiation payload', {
        ...logContext,
        payload: {
          ...payload,
          merchant_code: merchantCodeFingerprint,
          service_code: serviceCodeFingerprint,
        },
      });

      const response = await this.client.post<UrubutoInitiatePaymentResponse>(
        '/api/v2/payment/initiate',
        payload,
      );

      logger.info('UrubutoPay payment initiation response', {
        response,
        config: this.config,
      });

      const data = response.data.data;
      const status = this.mapStatusToInternal(data?.transaction_status);
      const urubutoReference =
        data?.internal_transaction_ref_number || request.refId;
      const cardProcessingUrl = response.data.card_processing_url;
      logger.info('UrubutoPay payment initiation card processing url', {
        cardProcessingUrl,
      });
      const hostedCheckoutUrl =
        channelName !== UrubutoChannelName.CARD
          ? this.getHostedCheckoutUrl(request.payerCode)
          : undefined;
      logger.info('UrubutoPay payment initiation hosted checkout url', {
        hostedCheckoutUrl,
      });
      const paymentUrl = cardProcessingUrl || hostedCheckoutUrl;
      const apiSuccess =
        response.data.status === 200 || response.status === 200;

      if (!apiSuccess) {
        const message = mapUrubutoInitiateErrorMessage(response.data.message);
        const serviceCodeError = isUrubutoServiceCodeError(response.data.message);
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
            metadata: {
              apiEnvironment,
              serviceCodeSource: 'URUBUTO_SERVICE_CODE',
              merchantCodeFingerprint,
              serviceCodeFingerprint,
              serviceCodeError,
            },
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
      const isTimeout =
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' ||
        error.message?.toLowerCase().includes('timeout');
      const rawMessage =
        error.response?.data?.message ||
        error.message ||
        'UrubutoPay payment initiation failed.';
      const serviceCodeError = isUrubutoServiceCodeError(rawMessage);

      logger.error('UrubutoPay payment initiation error', {
        ...logContext,
        httpStatus: error.response?.status,
        urubutoResponse: error.response?.data,
        errorCode: error.code,
        message: rawMessage,
      });

      return {
        success: false,
        error: {
          code: isTimeout
            ? 'URUBUTO_TIMEOUT'
            : error.response?.status?.toString() || 'URUBUTO_ERROR',
          message: isTimeout
            ? 'UrubutoPay payment initiation timed out. The transaction status should be reconciled before marking the payment failed.'
            : mapUrubutoInitiateErrorMessage(rawMessage),
          metadata: {
            localPaymentId: request.refId,
            transactionId: request.refId,
            channelName,
            payerCode: request.payerCode,
            apiEnvironment,
            serviceCodeSource: 'URUBUTO_SERVICE_CODE',
            merchantCodeFingerprint,
            serviceCodeFingerprint,
            serviceCodeError,
            rawMessage,
            ...(error.code ? { axiosCode: error.code } : {}),
          },
        },
      };
    }
  }
}
