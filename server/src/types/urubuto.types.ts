import { UUID } from '.';
import { KpayCurrency, KpayPaymentStatus } from './kpay.types';

export enum PaymentProvider {
  URUBUTO = 'URUBUTO',
  KPAY = 'KPAY',
}

export enum UrubutoChannelName {
  MOMO = 'MOMO',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  CARD = 'CARD',
}

export enum UrubutoPaymentChannel {
  WALLET = 'WALLET',
  CARD = 'CARD',
}

export enum UrubutoTransactionStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  PENDING_SETTLEMENT = 'PENDING_SETTLEMENT',
  VALID = 'VALID',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export interface UrubutoConfig {
  baseUrl: string;
  apiKey: string;
  merchantCode: string;
  serviceCode: string;
  webhookUsername: string;
  webhookPassword: string;
  webhookJwtSecret: string;
  checkoutBaseUrl: string;
}

export interface UrubutoInitiatePaymentRequest {
  merchant_code: string;
  payer_code: string;
  payer_names: string;
  payer_email?: string;
  phone_number: string;
  amount: number;
  channel_name: UrubutoChannelName;
  transaction_id: UUID;
  service_code: string;
  redirection_url?: string;
}

export interface UrubutoInitiatePaymentResponseData {
  payment_channel: UrubutoPaymentChannel;
  payment_channel_name: string;
  transaction_status: UrubutoTransactionStatus;
  internal_transaction_ref_number: string;
  transaction_date: string;
  external_transaction_ref_number: string;
  merchant_code: string;
  payer_code: string;
  paid_mount: number;
  payer_names: string;
  payer_phone_number: string;
  currency: KpayCurrency;
}

export interface UrubutoInitiatePaymentResponse {
  timestamp: string;
  status: number;
  message: string;
  card_processing_url?: string;
  url_validity?: string;
  data?: UrubutoInitiatePaymentResponseData;
}

export interface UrubutoPaymentWebhookPayload {
  status?: number;
  transaction_status?: UrubutoTransactionStatus;
  merchant_code: string;
  payer_code: string;
  payment_channel?: string;
  payment_channel_name?: string;
  amount?: number | string;
  currency?: KpayCurrency | string;
  payment_date_time?: string;
  callback_type?: string;
  metadata?: Record<string, any>;
  slip_number?: string;
  transaction_id?: string;
  internal_transaction_id?: string;
  commission_amount?: number;
  payment_purpose?: string;
  payment_purpose_code?: string;
  bank_name?: string;
  bank_account?: string;
  observation?: string;
  term?: string;
  academic_year?: string;
  initial_slip_number?: string;
}

export interface UrubutoWebhookAuthRequest {
  user_name?: string;
  password?: string;
}

export interface UrubutoPayerValidationRequest {
  merchant_code?: string;
  payer_code?: string;
}

export interface UrubutoPaymentResult {
  success: boolean;
  data?: {
    transactionId: string;
    paymentUrl?: string;
    reference: string;
    amount: number;
    currency: string;
    status: KpayPaymentStatus;
    message?: string;
    metadata: Record<string, any>;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface UrubutoVerifyTransactionStatusRequest {
  merchant_code: string;
  transaction_id: string;
}

export interface UrubutoVerifyTransactionStatusData {
  payment_channel?: UrubutoPaymentChannel | string;
  payment_channel_name?: string;
  transaction_status?: UrubutoTransactionStatus | string;
  internal_transaction_id?: string;
  transaction_id?: string;
  merchant_code?: string;
  service_code?: string;
  payer_code?: string;
  amount?: number;
  payer_names?: string;
  phone_number?: string;
  currency?: KpayCurrency | string;
  payment_date_time?: string;
  payer_email?: string;
}

export interface UrubutoVerifyTransactionStatusApiResponse {
  timestamp?: string;
  status: number;
  message?: string;
  data?: UrubutoVerifyTransactionStatusData;
}

export interface UrubutoVerifyTransactionStatusResult {
  success: boolean;
  timestamp?: string;
  message?: string;
  data?: UrubutoVerifyTransactionStatusData;
  error?: {
    code: string;
    message: string;
  };
}
