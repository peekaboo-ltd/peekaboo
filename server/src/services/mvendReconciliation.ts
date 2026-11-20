import logger from '../helpers/logger.helper';
import { MVEND_TIMEOUT, PROVIDER_UNREACHABLE, MvendService } from '../integrations/mvend/mvend.service';
import { PaymentStatus } from '../types/payment-status.types';
import { MvendCallbackPayload, MvendResult } from '../types/mvend.types';
import { UUID } from '../types';

// Pure(ish) MVend reconciliation logic, kept free of TypeORM so it can be
// unit tested. PaymentService supplies the persistence callbacks.

type PaymentLike = {
  id: UUID | string;
  amount: number | string;
  status: PaymentStatus;
  externalReferenceId?: string | null;
  metadata?: Record<string, any> | null;
};

export type ReconcileSource = 'callback' | 'cron' | 'manual';

export type ReconcileOutcome =
  | 'updated'
  | 'unchanged'
  | 'lookup_failed'
  | 'amount_mismatch'
  | 'missing_reference';

export interface ReconcileDeps<P extends PaymentLike> {
  getTransactionStatus: MvendService['getTransactionStatus'];
  updatePaymentStatus: (id: P['id'], status: PaymentStatus, metadata: Record<string, any>) => Promise<P>;
  updateMetadata: (id: P['id'], metadata: Record<string, any>) => Promise<void>;
  now?: () => Date;
}

const AMOUNT_TOLERANCE = 0.001;

// The MVend callback body is undocumented. Read only a transaction reference
// from it, trying the field names MVend uses elsewhere in its API.
export function extractCallbackTxref(payload: MvendCallbackPayload | undefined): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const candidates = [
    payload.txref,
    payload.merchant_trans_id,
    payload.merchantref,
    payload.data?.txref,
    payload.data?.merchant_trans_id,
    payload.transaction?.txref,
  ];
  for (const value of candidates) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (/^[A-Za-z0-9_-]{1,64}$/.test(text)) return text;
  }
  return undefined;
}

export async function reconcileMvendPayment<P extends PaymentLike>(
  payment: P,
  deps: ReconcileDeps<P>,
  options: { source: ReconcileSource; callbackPayload?: MvendCallbackPayload } = { source: 'manual' },
): Promise<{ payment: P; outcome: ReconcileOutcome }> {
  const now = (deps.now ?? (() => new Date()))().toISOString();
  const txref = payment.externalReferenceId;
  const callbackMeta = options.callbackPayload
    ? { mvendCallbackPayload: options.callbackPayload, mvendLastCallbackAt: now }
    : {};

  if (!txref) {
    return { payment, outcome: 'missing_reference' };
  }

  const lookup = await deps.getTransactionStatus(txref);
  if (!lookup.success || !lookup.status) {
    logger.error('MVend status lookup failed during reconciliation', {
      paymentId: payment.id,
      txref,
      source: options.source,
      error: lookup.error,
    });
    await deps.updateMetadata(payment.id, {
      ...(payment.metadata || {}),
      ...callbackMeta,
      mvendLastCheckedAt: now,
      mvendLastLookupError: lookup.error,
    });
    return { payment, outcome: 'lookup_failed' };
  }

  const remote = lookup.status;
  const baseMeta = {
    ...callbackMeta,
    mvendLastStatus: remote.rawStatus,
    mvendLastCheckedAt: now,
    mvendLastCheckSource: options.source,
    ...(remote.paymentRef ? { mvendPaymentRef: remote.paymentRef } : {}),
  };

  if (
    remote.amount !== undefined &&
    Math.abs(remote.amount - Number(payment.amount)) > AMOUNT_TOLERANCE
  ) {
    logger.error('MVend transaction amount does not match payment', {
      paymentId: payment.id,
      txref,
      expected: Number(payment.amount),
      actual: remote.amount,
    });
    await deps.updateMetadata(payment.id, {
      ...(payment.metadata || {}),
      ...baseMeta,
      mvendAmountMismatch: { expected: Number(payment.amount), actual: remote.amount, at: now },
    });
    return { payment, outcome: 'amount_mismatch' };
  }

  // Never let a late "pending" reopen a terminal payment.
  const isTerminal =
    payment.status === PaymentStatus.SUCCESSFUL || payment.status === PaymentStatus.FAILED;
  const nextStatus =
    remote.status === PaymentStatus.PENDING && isTerminal ? payment.status : remote.status;

  if (nextStatus === payment.status) {
    // Metadata-only write: avoids audit-log noise from the polling cron.
    await deps.updateMetadata(payment.id, { ...(payment.metadata || {}), ...baseMeta });
    return { payment, outcome: 'unchanged' };
  }

  const updated = await deps.updatePaymentStatus(payment.id, nextStatus, baseMeta);
  return { payment: updated, outcome: 'updated' };
}

export type TimeoutRecoveryOutcome = 'accepted' | 'unknown' | 'rejected';

// The debit POST timed out, so MVend may or may not hold the transaction.
// We own the txref, so: look it up; if MVend has no record, resend with the
// same txref (MVend answers 104 for a duplicate rather than double-debit).
export async function recoverMvendTimeout(
  txref: string,
  deps: {
    getTransactionStatus: MvendService['getTransactionStatus'];
    resend: () => Promise<MvendResult>;
  },
): Promise<{ outcome: TimeoutRecoveryOutcome; detail: Record<string, any> }> {
  const lookup = await deps.getTransactionStatus(txref);
  if (lookup.success) {
    return { outcome: 'accepted', detail: { via: 'lookup', rawStatus: lookup.status?.rawStatus } };
  }

  if (isTransportError(lookup.error?.code)) {
    return { outcome: 'unknown', detail: { via: 'lookup', error: lookup.error } };
  }

  const retry = await deps.resend();
  if (retry.success || retry.duplicate) {
    return { outcome: 'accepted', detail: { via: 'resend', duplicate: Boolean(retry.duplicate) } };
  }
  if (isTransportError(retry.error?.code)) {
    return { outcome: 'unknown', detail: { via: 'resend', error: retry.error } };
  }
  return { outcome: 'rejected', detail: { via: 'resend', error: retry.error, lookupError: lookup.error } };
}

function isTransportError(code?: string): boolean {
  return code === MVEND_TIMEOUT || code === PROVIDER_UNREACHABLE;
}
