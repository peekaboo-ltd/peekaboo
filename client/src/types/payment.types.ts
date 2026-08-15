// Payment Types
export enum PaymentType {
  ORDER = 'ORDER',
}

// Payment Status (Based on Kpay)
export enum KpayPaymentStatus {
  PENDING = '03',
  SUCCESSFUL = '01',
  FAILED = '02',
}

export enum PaymentProvider {
  URUBUTO = 'URUBUTO',
  KPAY = 'KPAY',
}

/** Mirrors the server's UrubutoChannelName (server/src/types/urubuto.types.ts). */
export enum PaymentChannel {
  MOMO = 'MOMO',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  CARD = 'CARD',
}

export const MOBILE_MONEY_CHANNELS = [
  PaymentChannel.MOMO,
  PaymentChannel.AIRTEL_MONEY,
] as const;

export const isMobileMoneyChannel = (channel: PaymentChannel): boolean =>
  channel !== PaymentChannel.CARD;

export const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, string> = {
  [PaymentChannel.MOMO]: 'MTN Mobile Money',
  [PaymentChannel.AIRTEL_MONEY]: 'Airtel Money',
  [PaymentChannel.CARD]: 'Card (Visa / Mastercard)',
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
  status: KpayPaymentStatus;
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
