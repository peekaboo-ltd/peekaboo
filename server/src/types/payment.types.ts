import { UUID } from ".";
import { PaymentType } from "../constants/payment.constants";
import { KpayCurrency, KpayPaymentStatus } from "./kpay.types";
import { PaymentProvider, UrubutoChannelName } from "./urubuto.types";

// Payment creation DTO
export interface CreatePaymentDto {
  entityId: UUID;
  amount: number;
  currency: KpayCurrency;
  type: PaymentType;
  description?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  createdById?: UUID;
  provider?: PaymentProvider;
  method?: string;
  channelName?: UrubutoChannelName;
  metadata?: Record<string, any>;
}

// Payment response DTO
export interface PaymentResponseDto {
  id: UUID;
  entityId: UUID;
  internalReferenceId: string;
  amount: number;
  currency: 'RWF' | 'USD';
  type: PaymentType;
  status: KpayPaymentStatus;
  description?: string;
  method: string;
  provider: PaymentProvider;
  paymentUrl?: string;
  expiresAt?: Date;
  paidAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: UUID;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PublicPaymentStatusDto {
  id: UUID;
  entityId: UUID;
  status: KpayPaymentStatus;
  provider: PaymentProvider;
  method: string;
  amount: number;
  currency: 'RWF' | 'USD';
  externalReferenceId?: string;
  updatedAt: Date;
}

// Payment list query params
export interface PaymentQueryParams {
  entityId?: UUID;
  type?: PaymentType;
  status?: KpayPaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// Payment statistics response
export interface PaymentStatisticsDto {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalAmount: number;
  successRate: number;
  currency: 'RWF' | 'USD';
}

// Webhook validation response
export interface WebhookValidationDto {
  valid: boolean;
  signature?: string;
  timestamp?: string;
}
