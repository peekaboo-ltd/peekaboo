import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import logger from '../../helpers/logger.helper';
import { PaymentStatus } from '../../types/payment-status.types';
import {
  MvendBaseResponse,
  MvendConfig,
  MvendHashFields,
  MvendRequestType,
  MvendResult,
  MvendTransactionStatus,
  MvendTransactionStatusResponse,
} from '../../types/mvend.types';
import { buildMvendConfig, MVEND_MIN_DEBIT_RWF } from './mvend.config';
import { computeIntegrityHash } from './mvend.hash';

// Error codes surfaced in MvendResult.error.code. PROVIDER_UNREACHABLE means
// the request provably never reached MVend; MVEND_TIMEOUT means delivery is
// ambiguous (a transaction may exist and must be reconciled).
export const MVEND_TIMEOUT = 'MVEND_TIMEOUT';
export const PROVIDER_UNREACHABLE = 'PROVIDER_UNREACHABLE';

export const MVEND_STATUS_OK = 100;
export const MVEND_STATUS_DUPLICATE = 104;

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

// MVend does not publish its final status vocabulary, so map generously and
// leave anything unrecognised PENDING (the reconciliation cron retries it).
const SUCCESS_STATUSES = new Set([
  'successful',
  'success',
  'succeeded',
  'completed',
  'complete',
  'paid',
  'approved',
]);
const FAILED_STATUSES = new Set([
  'failed',
  'failure',
  'fail',
  'cancelled',
  'canceled',
  'rejected',
  'declined',
  'expired',
  'reversed',
  'rolledback',
  'rolled back',
  'timeout',
  'timedout',
]);

export function mapMvendStatus(status?: string | null): PaymentStatus {
  const normalized = (status || '').trim().toLowerCase();
  if (SUCCESS_STATUSES.has(normalized)) return PaymentStatus.SUCCESSFUL;
  if (FAILED_STATUSES.has(normalized)) return PaymentStatus.FAILED;
  return PaymentStatus.PENDING;
}

export function isMvendTimeoutError(error: any): boolean {
  return (
    AMBIGUOUS_DELIVERY_ERROR_CODES.has(error?.code) ||
    Boolean(error?.message?.toLowerCase().includes('timeout'))
  );
}

export function isMvendUnreachableError(error: any): boolean {
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

// Partner transaction reference. MVend examples use numeric refs, so use a
// digit-only string (millisecond clock + random suffix, 19 digits). Kept as a
// string because it exceeds Number.MAX_SAFE_INTEGER.
export function generateMvendTxref(now: number = Date.now()): string {
  const suffix = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  return `${now}${suffix}`;
}

export interface MvendDebitRequest {
  txref: string;
  amount: number;
  /** MSISDN, 250XXXXXXXXX */
  paymentAccount: string;
  currency?: string;
}

export interface MvendTokenDebitRequest {
  txref: string;
  amount: number;
  accountToken: string;
  currency?: string;
}

export interface MvendCreditRequest {
  txref: string;
  amount: number;
  /** MSISDN, 250XXXXXXXXX */
  creditAccount: string;
  currency?: string;
  narration?: string;
}

export class MvendService {
  private readonly client: AxiosInstance;
  private readonly config: MvendConfig;
  private readonly now: () => number;
  private authToken?: string;
  private authTokenExpiresAt = 0;

  constructor(
    config: MvendConfig = buildMvendConfig(),
    options: { client?: AxiosInstance; now?: () => number } = {},
  ) {
    this.config = config;
    this.now = options.now ?? Date.now;
    this.client =
      options.client ??
      axios.create({
        baseURL: this.config.baseUrl,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 60000,
      });
  }

  public getConfig(): Readonly<MvendConfig> {
    return this.config;
  }

  public isConfigured(): boolean {
    return Boolean(this.config.appId && this.config.appKey && this.config.salt);
  }

  public mapStatusToInternal(status?: string | null): PaymentStatus {
    return mapMvendStatus(status);
  }

  /** Request Payment (Debit): asks the subscriber to approve a debit. Async. */
  async requestPayment(request: MvendDebitRequest): Promise<MvendResult> {
    const invalid =
      this.validateAmount(request.amount) ||
      (!request.paymentAccount
        ? this.fail('INVALID_PHONE', 'A valid payer phone number is required')
        : undefined);
    if (invalid) return invalid;

    const currency = request.currency || this.config.currency;
    const amount = Math.round(request.amount);
    return this.send('paymentrequest', {
      txref: request.txref,
      amount,
      currency,
      payment_account: request.paymentAccount,
    });
  }

  /** Request Payment with Payment Token (Debit by account token). */
  async requestPaymentWithToken(request: MvendTokenDebitRequest): Promise<MvendResult> {
    const invalid =
      this.validateAmount(request.amount) ||
      (!request.accountToken
        ? this.fail('INVALID_ACCOUNT_TOKEN', 'An account token is required')
        : undefined);
    if (invalid) return invalid;

    const currency = request.currency || this.config.currency;
    // The docs do not list account_token among the hashed fields.
    return this.send(
      'acctokenpaymentrequest',
      { txref: request.txref, amount: Math.round(request.amount), currency },
      { account_token: request.accountToken },
    );
  }

  /** Make Payment (Credit): pays out from collections, e.g. a refund. */
  async makePayment(request: MvendCreditRequest): Promise<MvendResult> {
    if (!request.creditAccount) {
      return this.fail('INVALID_PHONE', 'A valid account to credit is required');
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      return this.fail('INVALID_AMOUNT', 'Amount must be a positive number');
    }
    const currency = request.currency || this.config.currency;
    return this.send(
      'makepayment',
      {
        txref: request.txref,
        amount: Math.round(request.amount),
        currency,
        creditaccount: request.creditAccount,
      },
      request.narration ? { narration: request.narration } : {},
    );
  }

  /** Rollback Transaction: reverses a debit whose funds were already taken. */
  async rollback(txref: string, rollbackTxref: string): Promise<MvendResult> {
    if (!txref || !rollbackTxref) {
      return this.fail('INVALID_REFERENCE', 'txref and rollback_txref are required');
    }
    return this.send('rollback', { txref, rollback_txref: rollbackTxref });
  }

  /** Get Merchant Account Balance. */
  async getAccountBalance(): Promise<MvendResult> {
    return this.send('getaccountbalance', {});
  }

  /** Get Transaction Status, normalised to an internal PaymentStatus. */
  async getTransactionStatus(
    txref: string,
  ): Promise<MvendResult<MvendTransactionStatusResponse> & { status?: MvendTransactionStatus }> {
    if (!txref) return this.fail('INVALID_REFERENCE', 'txref is required');

    const result = await this.send<MvendTransactionStatusResponse>('gettransactionstatus', {
      txref,
    });
    if (!result.success || !result.data) return result;

    const body = result.data;
    const rawStatus =
      body.data?.transaction_status ?? body.status ?? body.transactionstatus ?? undefined;
    const rawAmount = body.data?.transaction_amount;
    const amount = rawAmount === undefined || rawAmount === null ? undefined : Number(rawAmount);
    const paymentRef = body.paymentref ?? body.data?.paymentref ?? undefined;

    return {
      ...result,
      status: {
        txref: String(body.txref ?? txref),
        rawStatus: rawStatus ?? undefined,
        status: mapMvendStatus(rawStatus),
        amount: Number.isFinite(amount) ? amount : undefined,
        paymentRef: paymentRef === null || paymentRef === undefined ? undefined : String(paymentRef),
        raw: body,
      },
    };
  }

  private validateAmount(amount: number): MvendResult | undefined {
    if (!Number.isFinite(amount) || amount < MVEND_MIN_DEBIT_RWF) {
      return this.fail(
        'AMOUNT_BELOW_MINIMUM',
        `MVend debits require at least ${MVEND_MIN_DEBIT_RWF} RWF.`,
        { amount, minimum: MVEND_MIN_DEBIT_RWF },
      );
    }
    return undefined;
  }

  private fail(code: string, message: string, metadata?: Record<string, any>): MvendResult<any> {
    return { success: false, error: { code, message, metadata } };
  }

  private buildBody(
    requesttype: MvendRequestType,
    hashed: Omit<MvendHashFields, 'timestamp'>,
    extra: Record<string, any> = {},
  ): Record<string, any> {
    const timestamp = Math.floor(this.now() / 1000);
    const appid = /^\d+$/.test(this.config.appId) ? Number(this.config.appId) : this.config.appId;
    return {
      requesttype,
      appid,
      appkey: this.config.appKey,
      timestamp,
      ...hashed,
      ...extra,
      integrity_hash: computeIntegrityHash({ timestamp, ...hashed }, this.config.salt),
    };
  }

  private async send<T extends MvendBaseResponse = MvendBaseResponse>(
    requesttype: MvendRequestType,
    hashed: Omit<MvendHashFields, 'timestamp'>,
    extra: Record<string, any> = {},
  ): Promise<MvendResult<T>> {
    if (!this.isConfigured()) {
      return this.fail(
        'CONFIGURATION_ERROR',
        'MVend configuration is incomplete. Check MVEND_APP_ID, MVEND_APP_KEY and MVEND_SALT.',
      );
    }

    try {
      const headers: Record<string, string> = {};
      if (this.config.useTokenAuth) {
        headers.Authorization = `Token ${await this.getAuthToken()}`;
      }
      const body = this.buildBody(requesttype, hashed, extra);
      const response = await this.client.post<T>(this.config.paymentsPath, body, { headers });
      return this.interpret<T>(requesttype, hashed.txref, response.data);
    } catch (error: any) {
      // Some gateways answer business errors with non-2xx and a normal body.
      const data = error?.response?.data;
      if (data && typeof data === 'object' && 'status_code' in data) {
        return this.interpret<T>(requesttype, hashed.txref, data as T);
      }
      return this.toTransportError(requesttype, error);
    }
  }

  private interpret<T extends MvendBaseResponse>(
    requesttype: MvendRequestType,
    txref: string | number | undefined,
    data: T,
  ): MvendResult<T> {
    const code = Number(data?.status_code);
    const message = data?.response_errormsg || 'Unknown MVend response';

    if (code === MVEND_STATUS_OK) {
      logger.info('MVend request accepted', { requesttype, txref, paymentref: data?.paymentref });
      return { success: true, data };
    }
    if (code === MVEND_STATUS_DUPLICATE) {
      logger.info('MVend reported duplicate txref', { requesttype, txref });
      return {
        success: false,
        duplicate: true,
        data,
        error: { code: `MVEND_${MVEND_STATUS_DUPLICATE}`, message },
      };
    }

    logger.error('MVend request rejected', { requesttype, txref, statusCode: data?.status_code, message });
    return {
      success: false,
      data,
      error: {
        code: Number.isFinite(code) ? `MVEND_${code}` : 'MVEND_ERROR',
        message: String(message),
        metadata: { statusCode: data?.status_code },
      },
    };
  }

  private toTransportError(requesttype: MvendRequestType, error: any): MvendResult<any> {
    if (isMvendUnreachableError(error)) {
      logger.error('MVend request could not reach the provider', {
        requesttype,
        transportErrorCode: error?.code || error?.cause?.code,
        message: error?.message,
      });
      return this.fail(
        PROVIDER_UNREACHABLE,
        'The payment provider is temporarily unreachable. No payment was taken. Please try again shortly.',
      );
    }

    if (isMvendTimeoutError(error)) {
      logger.error('MVend request timed out; delivery is ambiguous', {
        requesttype,
        transportErrorCode: error?.code,
        message: error?.message,
      });
      return this.fail(
        MVEND_TIMEOUT,
        'The payment provider did not respond in time. The payment status will be reconciled automatically.',
      );
    }

    const status = error?.response?.status;
    const message =
      error?.response?.data?.response_errormsg ||
      error?.response?.data?.message ||
      error?.message ||
      'MVend request failed.';
    logger.error('MVend request failed', { requesttype, httpStatus: status, message });
    return this.fail(
      status ? `MVEND_HTTP_${status}` : 'MVEND_ERROR',
      String(message),
      status ? { httpStatus: status } : undefined,
    );
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken && this.now() < this.authTokenExpiresAt) return this.authToken;

    const response = await this.client.post('/auth/user/token', {
      app_key: this.config.appKey,
      auth_string: this.config.authString,
    });
    const body = response.data || {};
    // The token response shape is undocumented; accept the common spellings.
    const token = body.token ?? body.access_token ?? body.data?.token ?? body.data?.access_token;
    if (!token) {
      throw new Error('MVend auth response did not include a token');
    }
    this.authToken = String(token);
    // Lifetime is undocumented; refresh every 10 minutes to stay safe.
    this.authTokenExpiresAt = this.now() + 10 * 60_000;
    return this.authToken;
  }
}
