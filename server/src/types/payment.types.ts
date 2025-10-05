import { UUID } from ".";
import { PaymentType } from "../constants/payment.constants";
import { KpayPaymentStatus } from "./kpay.types";

// Payment creation DTO
export interface CreatePaymentDto {
  entityId: UUID;
  amount: number;
  currency: 'RWF' | 'USD';
  type: PaymentType;
  description?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
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