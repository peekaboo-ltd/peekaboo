import { PaymentStatus } from './payment-status.types';

// MVend (MVendPay / MPS) Payments API. Every operation is a POST to the same
// endpoint; `requesttype` selects the operation.
export type MvendRequestType =
  | 'paymentrequest'
  | 'acctokenpaymentrequest'
  | 'makepayment'
  | 'gettransactionstatus'
  | 'rollback'
  | 'getaccountbalance';

export interface MvendConfig {
  /** Host only, e.g. https://qa.mvendpay.com */
  baseUrl: string;
  /** Path of the Payments endpoint, e.g. /mpay/requestpayment */
  paymentsPath: string;
  appId: string;
  appKey: string;
  /** App salt issued by MVend; HMAC-SHA256 key for integrity_hash. */
  salt: string;
  currency: string;
  /** Opt-in bearer token auth (`Authorization: Token {token}`). */
  useTokenAuth: boolean;
  authString: string;
  /** Shared secret embedded in the callback URL path registered on MPS. */
  callbackToken: string;
}

// Fields that take part in the integrity hash, in the documented order:
// timestamp, txref, amount, currency, payment_account, creditaccount,
// rollback_txref. Missing fields contribute an empty string.
export interface MvendHashFields {
  timestamp?: number | string;
  txref?: number | string;
  amount?: number | string;
  currency?: string;
  payment_account?: string;
  creditaccount?: string;
  rollback_txref?: number | string;
}

export interface MvendBaseRequest {
  requesttype: MvendRequestType;
  appid: number | string;
  appkey: string;
  timestamp: number;
  integrity_hash: string;
}

export interface MvendBaseResponse {
  status_code: number | string;
  response_errormsg?: string;
  [key: string]: any;
}

// Body of a gettransactionstatus response (`data` mirrors the MPS record).
export interface MvendTransactionStatusResponse extends MvendBaseResponse {
  txref?: string | number;
  status?: string;
  paymentref?: string | number | null;
  data?: {
    request_date?: string;
    request_id?: number;
    request_type?: string;
    merchant_trans_id?: string | number;
    pay_serv_account?: string;
    transaction_amount?: string | number;
    transaction_status?: string;
    paymentref?: string | number | null;
    commission_charged?: string | number | null;
    response_code?: string | number | null;
    responsemsg?: string | null;
    lastupdated?: string | null;
    [key: string]: any;
  };
}

// MVend does not document the payment-completed notification payload, so
// the callback is treated as an untrusted trigger: only a transaction ref is
// read from it and the outcome is confirmed via gettransactionstatus.
export type MvendCallbackPayload = Record<string, any>;

export interface MvendResult<T = MvendBaseResponse> {
  success: boolean;
  /** True when MVend answered 104 (txref already submitted). */
  duplicate?: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    metadata?: Record<string, any>;
  };
}

export interface MvendTransactionStatus {
  txref: string;
  rawStatus?: string;
  status: PaymentStatus;
  amount?: number;
  paymentRef?: string;
  raw: MvendTransactionStatusResponse;
}
