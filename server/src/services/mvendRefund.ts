import { PaymentProvider } from '../types/payment-provider.types';
import { PaymentStatus } from '../types/payment-status.types';

// Refunds of MVend payments. Two mechanisms from the Payments API:
// - rollback: reverses the original debit (full amount)
// - credit:   makepayment to the payer's MSISDN (full or partial amount)
export type MvendRefundMethod = 'rollback' | 'credit';

// requested: claimed, provider call in flight
// accepted:  MVend accepted the request (status_code 100 or 104)
// unknown:   the call timed out; check with MVend before retrying
// failed:    MVend rejected it; a new refund may be attempted
export type MvendRefundState = 'requested' | 'accepted' | 'unknown' | 'failed';

export interface MvendRefundRecord {
  method: MvendRefundMethod;
  txref: string;
  amount: number;
  state: MvendRefundState;
  requestedAt: string;
  requestedById?: string;
  completedAt?: string;
  statusCode?: number | string;
  paymentRef?: string;
  transactionStatus?: string;
  error?: { code: string; message: string };
}

type RefundablePayment = {
  provider?: string | null;
  status: PaymentStatus;
  amount: number | string;
  externalReferenceId?: string | null;
  customerPhone?: string | null;
  metadata?: Record<string, any> | null;
};

// Returns the amount to refund, or throws an Error with a user-facing message.
export function assertRefundable(
  payment: RefundablePayment,
  method: MvendRefundMethod,
  requestedAmount?: number,
): number {
  if (payment.provider !== PaymentProvider.MVEND) {
    throw new Error('Only MVend payments can be refunded from here');
  }
  if (payment.status !== PaymentStatus.SUCCESSFUL) {
    throw new Error('Only successful payments can be refunded');
  }
  if (!payment.externalReferenceId) {
    throw new Error('Payment has no MVend transaction reference');
  }

  const existing = payment.metadata?.mvendRefund as MvendRefundRecord | undefined;
  if (existing && existing.state !== 'failed') {
    throw new Error(
      existing.state === 'unknown'
        ? 'A previous refund timed out. Confirm its outcome with MVend before retrying.'
        : 'A refund has already been requested for this payment',
    );
  }

  const paid = Number(payment.amount);
  if (method === 'rollback') {
    if (requestedAmount !== undefined && requestedAmount !== paid) {
      throw new Error('A rollback always refunds the full amount');
    }
    return paid;
  }

  if (!payment.customerPhone) {
    throw new Error('Payment has no payer phone number to credit');
  }
  const amount = requestedAmount ?? paid;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Refund amount must be a positive number');
  }
  if (amount > paid) {
    throw new Error('Refund amount cannot exceed the amount paid');
  }
  return amount;
}
