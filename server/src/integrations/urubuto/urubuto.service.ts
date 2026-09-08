import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { UUID } from '../../types';
import { KpayCurrency, KpayPaymentStatus } from '../../types/kpay.types';
import {
  UrubutoChannelName,
  UrubutoAccountHolderValidationApiResponse,
  UrubutoAccountHolderValidationResult,
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
import { formatPhoneForProvider } from '../../helpers/phone.helper';

function maskUrubutoValue(value?: string): string | undefined {
  if (!value) return value;
  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (value.length <= 6) return '***';
  return `${value.slice(0, 5)}***${value.slice(-2)}`;
}

function sanitizeUrubutoData<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((value) => sanitizeUrubutoData(value)) as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(
    data as Record<string, unknown>,
  )) {
    sanitized[field] =
      [
        'phone_number',
        'payer_phone_number',
        'payer_email',
        'payer_names',
        'bank_account',
      ].includes(field) &&
      typeof value === 'string'
        ? maskUrubutoValue(value)
        : sanitizeUrubutoData(value);
  }
  return sanitized as T;
}

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

// Node/axios codes for failures that happen before UrubutoPay ever sees the
// request: DNS, refused or unroutable connections, and TLS handshake
// rejections such as the provider letting its certificate expire. Deliberately
// excludes timeouts and mid-flight resets, which may well have been delivered.
const UNREACHABLE_ERROR_CODES = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EHOSTDOWN',
  'ENETDOWN',
  'CERT_HAS_EXPIRED',
  'CERT_NOT_YET_VALID',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'ERR_TLS_CERT_ALTNAME_INVALID',
]);

const AMBIGUOUS_DELIVERY_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ETIMEDOUT',
  'ECONNRESET',
  'EPIPE',
]);

export function isUrubutoTimeoutError(error: any): boolean {
  return (
    error?.code === 'ETIMEDOUT' ||
    error?.code === 'ECONNABORTED' ||
    Boolean(error?.message?.toLowerCase().includes('timeout'))
  );
}

// True only when the request provably never reached UrubutoPay, so the caller
// can fail fast knowing no transaction was created on their side. An error
// carrying a response came from UrubutoPay itself and is never unreachable.
export function isUrubutoUnreachableError(error: any): boolean {
  if (error?.response) return false;
  if (AMBIGUOUS_DELIVERY_ERROR_CODES.has(error?.code)) return false;
  if (UNREACHABLE_ERROR_CODES.has(error?.code)) return true;
  if (UNREACHABLE_ERROR_CODES.has(error?.cause?.code)) return true;

  // Some TLS failures reach us with the reason only in the message.
  const lower = (error?.message || '').toLowerCase();
  return (
    lower.includes('certificate has expired') ||
    lower.includes('unable to verify the first certificate') ||
    lower.includes('self signed certificate')
  );
}

function isCertificateError(error: any): boolean {
  const code = error?.code || error?.cause?.code || '';
  const lower = (error?.message || '').toLowerCase();
  return code.includes('CERT') || lower.includes('certificate');
}

// Kept deliberately vague for the payer: an expired provider certificate is
// not something they can act on, and naming it invites the dangerous "just
// disable TLS verification" workaround. The operational detail goes to the log.
export function urubutoUnreachableMessage(error: any): string {
  return isCertificateError(error)
    ? 'UrubutoPay is temporarily unavailable because of a problem with their secure connection. No payment was taken. Please try again shortly.'
    : 'UrubutoPay is temporarily unreachable. No payment was taken. Please try again shortly.';
}

function unreachableLogContext(error: any): Record<string, unknown> {
  return {
    reason: 'PROVIDER_UNREACHABLE',
    transportErrorCode: error?.code || error?.cause?.code,
    certificateError: isCertificateError(error),
    message: error?.message,
  };
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
      timeout: 300000,
    });
  }

  public getConfig(): Readonly<UrubutoConfig> {
    return this.config;
  }

  private safeConfigSnapshot(): Record<string, string> {
    return {
      baseUrl: this.config.baseUrl,
      checkoutBaseUrl: this.config.checkoutBaseUrl,
      merchantCode: this.config.merchantCode,
      serviceCode: this.config.serviceCode,
      apiKeyFingerprint: urubutoCredentialFingerprint(this.config.apiKey),
      webhookJwtSecretFingerprint: urubutoCredentialFingerprint(
        this.config.webhookJwtSecret,
      ),
    };
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
        usernameProvided: request.user_name,
        usernameMatches: request.user_name === this.config.webhookUsername,
        credentialsConfigured: hasCredentials,
        config: this.safeConfigSnapshot(),
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
      logger.debug('UrubutoPay webhook token verified', {
        sub: payload.sub,
      });
      return payload.sub === 'urubuto-webhooks';
    } catch (error: any) {
      logger.error('UrubutoPay webhook token verification failed', {
        reason: error?.message,
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

  async validateAccountHolder(request: {
    customerPhone: string;
    channelName: UrubutoChannelName.MOMO | UrubutoChannelName.AIRTEL_MONEY;
  }): Promise<UrubutoAccountHolderValidationResult> {
    const payerPhoneNumber = formatPhoneForProvider(request.customerPhone);
    if (!this.config.apiKey || !payerPhoneNumber) {
      return {
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'UrubutoPay wallet validation configuration is incomplete.',
        },
      };
    }

    try {
      const response =
        await this.client.post<UrubutoAccountHolderValidationApiResponse>(
          '/api/v2/payment/account-holder/validate',
          {
            payer_phone_number: payerPhoneNumber,
            payment_channel_name: request.channelName,
          },
        );
      const success = response.status === 200 && response.data.status === 200;

      logger.info('UrubutoPay wallet validation result', {
        paymentChannelName: request.channelName,
        payerPhoneNumber: maskUrubutoValue(payerPhoneNumber),
        success,
        valid: response.data.data?.valid,
      });

      return {
        success,
        valid: success ? response.data.data?.valid === true : undefined,
        message: response.data.message,
        error: success
          ? undefined
          : {
              code: String(response.data.status || response.status),
              message:
                response.data.message ||
                'UrubutoPay could not validate this mobile money account.',
            },
      };
    } catch (error: any) {
      // Nothing about the account was actually checked when we never reached
      // UrubutoPay, so do not blame the payer's number for an outage.
      if (isUrubutoUnreachableError(error)) {
        logger.error('UrubutoPay wallet validation could not reach the provider', {
          paymentChannelName: request.channelName,
          payerPhoneNumber: maskUrubutoValue(payerPhoneNumber),
          ...unreachableLogContext(error),
        });

        return {
          success: false,
          error: {
            code: 'PROVIDER_UNREACHABLE',
            message: urubutoUnreachableMessage(error),
          },
        };
      }

      logger.error('UrubutoPay wallet validation failed', {
        paymentChannelName: request.channelName,
        payerPhoneNumber: maskUrubutoValue(payerPhoneNumber),
        httpStatus: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'URUBUTO_ERROR',
          message:
            error.response?.data?.message ||
            'UrubutoPay could not validate this mobile money account.',
        },
      };
    }
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

      logger.debug('UrubutoPay transaction status raw response', {
        transactionId,
        httpStatus: response.status,
        data: sanitizeUrubutoData(response?.data),
      });

      const isSuccess =
        response.data.status === 200 || response.status === 200;

      logger.info('UrubutoPay transaction status result', {
        transactionId,
        isSuccess,
        data: sanitizeUrubutoData(response.data.data),
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
      if (isUrubutoUnreachableError(error)) {
        logger.error('UrubutoPay transaction status could not reach the provider', {
          transactionId,
          ...unreachableLogContext(error),
        });

        return {
          success: false,
          error: {
            code: 'PROVIDER_UNREACHABLE',
            message: urubutoUnreachableMessage(error),
          },
        };
      }

      logger.error('UrubutoPay transaction status error', {
        transactionId,
        merchantCodeFingerprint: urubutoCredentialFingerprint(
          this.config.merchantCode,
        ),
        httpStatus: error.response?.status,
        response: sanitizeUrubutoData(error.response?.data),
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
        phone_number: formatPhoneForProvider(request.customerPhone) || '',
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
          payer_names: maskUrubutoValue(payload.payer_names),
          phone_number: maskUrubutoValue(payload.phone_number),
          payer_email: maskUrubutoValue(payload.payer_email),
        },
      });

      const response = await this.client.post<UrubutoInitiatePaymentResponse>(
        '/api/v2/payment/initiate',
        payload,
      );

      logger.debug('UrubutoPay payment initiation response received', {
        ...logContext,
        httpStatus: response.status,
        urubutoStatus: response.data?.status,
        data: sanitizeUrubutoData(response.data?.data),
        message: response.data?.message,
      });

      const data = response.data.data;
      const status = KpayPaymentStatus.PENDING;
      const urubutoReference =
        data?.internal_transaction_ref_number || request.refId;
      const cardProcessingUrl = response.data.card_processing_url;
      logger.debug('UrubutoPay payment initiation resolved checkout URLs', {
        transaction_id: request.refId,
        cardProcessingUrl,
      });
      const paymentUrl = cardProcessingUrl;
      const apiSuccess =
        response.status >= 200 &&
        response.status < 300 &&
        response.data.status === 200;

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

      if (
        !data?.transaction_status ||
        !data.internal_transaction_ref_number
      ) {
        return {
          success: false,
          error: {
            code: 'INVALID_URUBUTO_RESPONSE',
            message:
              'UrubutoPay returned an incomplete payment initiation response. Please try again.',
          },
        };
      }

      if (
        data.transaction_status === UrubutoTransactionStatus.FAILED ||
        data.transaction_status === UrubutoTransactionStatus.CANCELED
      ) {
        return {
          success: false,
          error: {
            code: data.transaction_status,
            message:
              response.data.message ||
              'UrubutoPay rejected the payment initiation.',
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
            urlValidity: response.data.url_validity,
            initiationResponse: sanitizeUrubutoData(response.data),
          },
        },
      };
    } catch (error: any) {
      // Timeout is checked first and deliberately wins: the request may have
      // been delivered, so the payment has to be reconciled rather than
      // declared undelivered.
      const isTimeout = isUrubutoTimeoutError(error);
      const isUnreachable = !isTimeout && isUrubutoUnreachableError(error);
      const rawMessage =
        error.response?.data?.message ||
        error.message ||
        'UrubutoPay payment initiation failed.';
      const serviceCodeError = isUrubutoServiceCodeError(rawMessage);

      if (isUnreachable) {
        logger.error('UrubutoPay payment initiation could not reach the provider', {
          ...logContext,
          ...unreachableLogContext(error),
        });

        return {
          success: false,
          error: {
            code: 'PROVIDER_UNREACHABLE',
            message: urubutoUnreachableMessage(error),
            metadata: {
              localPaymentId: request.refId,
              transactionId: request.refId,
              channelName,
              payerCode: request.payerCode,
              apiEnvironment,
              transportErrorCode: error.code || error.cause?.code,
              rawMessage,
            },
          },
        };
      }

      logger.error('UrubutoPay payment initiation error', {
        ...logContext,
        httpStatus: error.response?.status,
        urubutoResponse: sanitizeUrubutoData(error.response?.data),
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
