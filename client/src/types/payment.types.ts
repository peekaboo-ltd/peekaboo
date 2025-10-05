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
