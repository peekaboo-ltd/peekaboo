// Payment Types
export enum PaymentType {
  ORDER = 'ORDER',
}

// Payment Status (stored codes shared with the server PaymentStatus enum)
export enum PaymentStatus {
  PENDING = '03',
  SUCCESSFUL = '01',
  FAILED = '02',
}

export enum PaymentProvider {
  PAYPACK = 'PAYPACK',
  // Retired providers, kept so historical payments still map.
  URUBUTO = 'URUBUTO',
  KPAY = 'KPAY',
}

/** Mirrors the server's PaypackChannel (server/src/types/paypack.types.ts). */
export enum PaymentChannel {
  MOMO = 'MOMO',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
}

export const MOBILE_MONEY_CHANNELS = [
  PaymentChannel.MOMO,
  PaymentChannel.AIRTEL_MONEY,
] as const;

export const isMobileMoneyChannel = (channel: PaymentChannel): boolean =>
  (MOBILE_MONEY_CHANNELS as readonly string[]).includes(channel);

export const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, string> = {
  [PaymentChannel.MOMO]: 'MTN Mobile Money',
  [PaymentChannel.AIRTEL_MONEY]: 'Airtel Money',
};

// Payment Entity (matches backend Payment entity)
export interface Payment {
  // Base entity fields (from AbstractEntity)
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Payment specific fields
  entityId: string;
  internalReferenceId: string;
  amount: number;
  currency: 'RWF' | 'USD';
  externalReferenceId: string;
  createdById: string;
  type: PaymentType;
  status: PaymentStatus;
  description: string;
  method: string;
  provider: PaymentProvider;
  paymentUrl?: string;

  // Customer fields
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;

  // Payment timestamps
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;

  // Refund fields
  refundId?: string;
  refundedAmount?: number;
  refundedAt?: string;
  refundReason?: string;

  // Failure reason
  failureReason?: string;

  // Metadata
  metadata?: Record<string, string>;

  // Relations
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PublicPaymentStatus {
  id: string;
  entityId: string;
  amount: number;
  currency: 'RWF' | 'USD';
  externalReferenceId?: string;
  status: PaymentStatus;
  method: string;
  provider: PaymentProvider;
  updatedAt: string;
}
