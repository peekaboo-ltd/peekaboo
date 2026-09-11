import { UUID } from '.';
import { PaymentCurrency, PaymentStatus } from './payment-status.types';

// Payment providers. URUBUTO and KPAY are retired; the members stay so
// historical rows in the varchar provider column keep mapping to the enum.
export enum PaymentProvider {
  PAYPACK = 'PAYPACK',
  URUBUTO = 'URUBUTO',
  KPAY = 'KPAY',
}

// Mobile-money rails offered to payers. Paypack cashin takes only a phone
// number and infers the network, so these are UX labels that all map to the
// same call.
export enum PaypackChannel {
  MOMO = 'MOMO',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
}

// Paypack environment. The SDK/REST layer sends this as the X-Webhook-Mode
// header, which must match the mode registered on the Paypack dashboard
// webhook or no webhook is delivered.
export type PaypackEnvironment = 'development' | 'production';

export interface PaypackConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  environment: PaypackEnvironment;
}

export type PaypackTransactionKind = 'CASHIN' | 'CASHOUT';

// Raw Paypack statuses observed on transactions and webhook payloads.
export type PaypackTransactionStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | string;

export interface PaypackAuthResponse {
  access: string;
  refresh: string;
  expires: string;
}

export interface PaypackCashinRequest {
  amount: number;
  number: string;
}

export interface PaypackCashinResponseData {
  amount: number;
  created_at: string;
  kind: PaypackTransactionKind;
  ref: string;
  status: PaypackTransactionStatus;
}

export interface PaypackTransactionData {
  amount: number;
  client: string;
  fee: number;
  kind: PaypackTransactionKind;
  merchant: string;
  provider: string;
  ref: string;
  status: PaypackTransactionStatus;
  timestamp: string;
}

// GET /transactions/find/{ref} response body.
export interface PaypackFindTransactionResponse {
  amount: number;
  client: string;
  fee: number;
  kind: PaypackTransactionKind;
  merchant: string;
  provider: string;
  ref: string;
  status: PaypackTransactionStatus;
  timestamp: string;
}

export interface PaypackTransactionEventData {
  ref: string;
  kind: PaypackTransactionKind;
  fee: number;
  merchant: string;
  client: string;
  amount: number;
  provider: string;
  status: PaypackTransactionStatus;
  created_at: string;
  processed_at: string;
}

// POST body delivered to our webhook for a `transaction:processed` event.
export interface PaypackWebhookPayload {
  event_id: string;
  kind: string;
  created_at: string;
  data: PaypackTransactionEventData;
}

export interface PaypackPaymentResult {
  success: boolean;
  data?: {
    transactionId: string;
    reference: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    message?: string;
    metadata: Record<string, any>;
  };
  error?: {
    code: string;
    message: string;
    metadata?: Record<string, any>;
  };
}

export interface PaypackInitiatePaymentRequest {
  amount: number;
  currency: PaymentCurrency;
  customerPhone: string;
  refId: UUID;
  idempotencyKey: string;
  channel: PaypackChannel;
}
