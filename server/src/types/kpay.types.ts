// Kpay Payment Gateway Types and Interfaces

export interface KpayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  merchantId: string;
  webhookUrl?: string;
}

export interface KpayPaymentRequest {
  amount: number;
  currency: 'RWF' | 'USD';
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  orderId: string;
  description?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface KpayPaymentResponse {
  success: boolean;
  data?: {
    transactionId: string;
    paymentUrl: string;
    reference: string;
    amount: number;
    currency: string;
    status: KpayPaymentStatus;
    expiresAt: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface KpayWebhookPayload {
  event: KpayWebhookEvent;
  data: {
    transactionId: string;
    reference: string;
    amount: number;
    currency: string;
    status: KpayPaymentStatus;
    paidAt?: Date;
    paymentMethod?: string;
    customerInfo?: {
      email: string;
      name: string;
      phone?: string;
    };
    metadata?: Record<string, any>;
  };
  signature: string;
}

export interface KpayTransactionStatus {
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  status: KpayPaymentStatus;
  paymentMethod?: string;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  customerInfo?: {
    email: string;
    name: string;
    phone?: string;
  };
}

export enum KpayPaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum KpayWebhookEvent {
  PAYMENT_SUCCESSFUL = 'payment.successful',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  PAYMENT_EXPIRED = 'payment.expired',
  REFUND_SUCCESSFUL = 'refund.successful',
  REFUND_FAILED = 'refund.failed'
}

export enum KpayPaymentMethod {
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD'
}

export interface KpayRefundRequest {
  transactionId: string;
  amount?: number; // Optional for partial refunds
  reason: string;
}

export interface KpayRefundResponse {
  success: boolean;
  data?: {
    refundId: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    processedAt?: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}