import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { PaymentStatus } from '../../types/payment-status.types';
import {
  PaypackAuthResponse,
  PaypackConfig,
  PaypackFindTransactionResponse,
  PaypackInitiatePaymentRequest,
  PaypackPaymentResult,
  PaypackTransactionStatus,
} from '../../types/paypack.types';
import {
  buildPaypackConfig,
  PAYPACK_MIN_CASHIN_RWF,
} from './paypack.config';
import logger from '../../helpers/logger.helper';

// Error codes returned in PaypackPaymentResult.error.code. PROVIDER_UNREACHABLE
// means the request provably never reached Paypack (no transaction created);
// PAYPACK_TIMEOUT means delivery is ambiguous (a transaction may exist).
export const PAYPACK_TIMEOUT = 'PAYPACK_TIMEOUT';
export const PROVIDER_UNREACHABLE = 'PROVIDER_UNREACHABLE';

// Node/axios codes for failures that happen before Paypack ever sees the
// request. Deliberately excludes timeouts and mid-flight resets, which may
// well have been delivered.
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

export function isPaypackTimeoutError(error: any): boolean {
  return (
    error?.code === 'ETIMEDOUT' ||
    error?.code === 'ECONNABORTED' ||
    Boolean(error?.message?.toLowerCase().includes('timeout'))
  );
}

export function isPaypackUnreachableError(error: any): boolean {
  if (error?.response) return false;
  if (AMBIGUOUS_DELIVERY_ERROR_CODES.has(error?.code)) return false;
  if (UNREACHABLE_ERROR_CODES.has(error?.code)) return true;
  if (UNREACHABLE_ERROR_CODES.has(error?.cause?.code)) return true;

  const lower = (error?.message || '').toLowerCase();
  return (
    lower.includes('certificate has expired') ||
    lower.includes('unable to verify the first certificate') ||
    lower.includes('self signed certificate')
  );
}

export class PaypackService {
  private readonly client: AxiosInstance;
  private readonly config: PaypackConfig;
  private accessToken?: string;
  private refreshToken?: string;
  private accessTokenExpiresAt = 0;

  constructor(config: PaypackConfig = buildPaypackConfig()) {
    this.config = config;
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 60000,
    });
  }

  public getConfig(): Readonly<PaypackConfig> {
    return this.config;
  }

  public getEnvironment(): string {
    return this.config.environment;
  }

  public mapStatusToInternal(status?: PaypackTransactionStatus): PaymentStatus {
    switch ((status || '').toLowerCase()) {
      case 'successful':
        return PaymentStatus.SUCCESSFUL;
      case 'failed':
        return PaymentStatus.FAILED;
      case 'pending':
      default:
        return PaymentStatus.PENDING;
    }
  }

  // HMAC-SHA256 (base64) of the raw request body, compared against the
  // x-paypack-signature header. Must run on the unparsed body buffer.
  public verifyWebhookSignature(rawBody: Buffer, signature?: string): boolean {
    if (!signature || !this.config.webhookSecret) return false;
    try {
      const expected = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(rawBody)
        .digest('base64');
      const a = Buffer.from(expected);
      const b = Buffer.from(signature);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  async cashin(request: PaypackInitiatePaymentRequest): Promise<PaypackPaymentResult> {
    if (!this.config.clientId || !this.config.clientSecret) {
      return {
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message:
            'Paypack configuration is incomplete. Check PAYPACK_CLIENT_ID and PAYPACK_CLIENT_SECRET.',
        },
      };
    }

    if (!request.customerPhone) {
      return {
        success: false,
        error: { code: 'INVALID_PHONE', message: 'A valid payer phone number is required' },
      };
    }

    if (!Number.isFinite(request.amount) || request.amount < PAYPACK_MIN_CASHIN_RWF) {
      return {
        success: false,
        error: {
          code: 'AMOUNT_BELOW_MINIMUM',
          message: `Paypack cashin requires at least ${PAYPACK_MIN_CASHIN_RWF} RWF.`,
          metadata: { amount: request.amount, minimum: PAYPACK_MIN_CASHIN_RWF },
        },
      };
    }

    try {
      const token = await this.getAccessToken();
      const response = await this.client.post(
        '/transactions/cashin',
        { amount: Math.round(request.amount), number: request.customerPhone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Webhook-Mode': this.config.environment,
            'Idempotency-Key': request.idempotencyKey,
          },
        },
      );

      const data = response.data;
      logger.info('Paypack cashin accepted', {
        ref: data?.ref,
        amount: data?.amount,
        status: data?.status,
      });

      return {
        success: true,
        data: {
          transactionId: data.ref,
          reference: request.refId,
          amount: data.amount,
          currency: 'RWF',
          status: this.mapStatusToInternal(data.status),
          metadata: {
            paypackRef: data.ref,
            paypackKind: data.kind,
            paypackCreatedAt: data.created_at,
          },
        },
      };
    } catch (error: any) {
      return this.toPaymentResult(error);
    }
  }

  async findTransaction(ref: string): Promise<{
    success: boolean;
    data?: PaypackFindTransactionResponse;
    error?: { code: string; message: string };
  }> {
    if (!ref) {
      return {
        success: false,
        error: { code: 'INVALID_REFERENCE', message: 'Transaction ref is required' },
      };
    }
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get<PaypackFindTransactionResponse>(
        `/transactions/find/${encodeURIComponent(ref)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Paypack transaction not found' },
        };
      }
      const result = this.toPaymentResult(error);
      return { success: false, error: result.error };
    }
  }

  async listTransactions(filters: {
    limit?: number;
    offset?: number;
    kind?: string;
    client?: string;
  }): Promise<{ success: boolean; data?: any; error?: { code: string; message: string } }> {
    try {
      const token = await this.getAccessToken();
      const params = new URLSearchParams();
      if (filters.limit !== undefined) params.set('limit', String(filters.limit));
      if (filters.offset !== undefined) params.set('offset', String(filters.offset));
      if (filters.kind) params.set('kind', filters.kind);
      if (filters.client) params.set('client', filters.client);
      const query = params.toString();
      const response = await this.client.get(
        `/transactions/list${query ? `?${query}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      const result = this.toPaymentResult(error);
      return { success: false, error: result.error };
    }
  }

  private async getAccessToken(): Promise<string> {
    // Access tokens last ~15 minutes; refresh a minute early.
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    if (this.refreshToken) {
      try {
        const response = await this.client.get<PaypackAuthResponse>(
          `/auth/refresh/${encodeURIComponent(this.refreshToken)}`,
          { headers: { Accept: 'application/json' } },
        );
        this.storeTokens(response.data);
        return this.accessToken as string;
      } catch (error) {
        logger.info('Paypack token refresh failed, re-authorizing', {
          message: (error as any)?.message,
        });
        this.accessToken = undefined;
        this.refreshToken = undefined;
      }
    }

    const response = await this.client.post<PaypackAuthResponse>(
      '/auth/agents/authorize',
      { client_id: this.config.clientId, client_secret: this.config.clientSecret },
    );
    this.storeTokens(response.data);
    return this.accessToken as string;
  }

  private storeTokens(tokens: PaypackAuthResponse): void {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    // `expires` is opaque; fall back to the documented 15-minute lifetime.
    const lifetimeMs = this.parseExpiresToMs(tokens.expires) ?? 15 * 60_000;
    this.accessTokenExpiresAt = Date.now() + lifetimeMs;
  }

  private parseExpiresToMs(expires?: string): number | undefined {
    if (!expires) return undefined;
    const asNumber = Number(expires);
    if (Number.isFinite(asNumber) && asNumber > 0) {
      // Heuristic: values that look like seconds vs milliseconds.
      return asNumber < 1e10 ? asNumber * 1000 : asNumber;
    }
    const asDate = Date.parse(expires);
    if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now());
    return undefined;
  }

  private toPaymentResult(error: any): PaypackPaymentResult {
    if (isPaypackUnreachableError(error)) {
      logger.error('Paypack request could not reach the provider', {
        transportErrorCode: error?.code || error?.cause?.code,
        message: error?.message,
      });
      return {
        success: false,
        error: {
          code: PROVIDER_UNREACHABLE,
          message: 'Paypack is temporarily unreachable. No payment was taken. Please try again shortly.',
        },
      };
    }

    if (isPaypackTimeoutError(error)) {
      logger.error('Paypack request timed out; delivery is ambiguous', {
        transportErrorCode: error?.code,
        message: error?.message,
      });
      return {
        success: false,
        error: {
          code: PAYPACK_TIMEOUT,
          message: 'Paypack did not respond in time. The payment status will be reconciled automatically.',
        },
      };
    }

    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Paypack payment initiation failed.';
    logger.error('Paypack request failed', {
      httpStatus: status,
      message,
    });
    return {
      success: false,
      error: {
        code: status ? `PAYPACK_${status}` : 'PAYPACK_ERROR',
        message: String(message),
        metadata: status ? { httpStatus: status } : undefined,
      },
    };
  }
}

export { PAYPACK_MIN_CASHIN_RWF };
