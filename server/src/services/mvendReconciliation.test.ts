import test from 'node:test';
import assert from 'node:assert/strict';
import { PaymentStatus } from '../types/payment-status.types';
import { MvendResult } from '../types/mvend.types';
import { MVEND_TIMEOUT, mapMvendStatus } from '../integrations/mvend/mvend.service';
import {
  extractCallbackTxref,
  reconcileMvendPayment,
  recoverMvendTimeout,
} from './mvendReconciliation';

type FakePayment = {
  id: string;
  amount: number;
  status: PaymentStatus;
  externalReferenceId?: string | null;
  metadata?: Record<string, any>;
};

const NOW = new Date('2026-11-20T10:00:00.000Z');

function lookupResult(rawStatus: string, amount = 2000): any {
  return {
    success: true,
    data: { status_code: 100 },
    status: {
      txref: '111',
      rawStatus,
      status: mapMvendStatus(rawStatus),
      amount,
      paymentRef: '306568',
      raw: {},
    },
  };
}

function harness(lookup: any, payment: Partial<FakePayment> = {}) {
  const statusUpdates: any[] = [];
  const metadataUpdates: any[] = [];
  const lookups: string[] = [];
  const subject: FakePayment = {
    id: 'pay-1',
    amount: 2000,
    status: PaymentStatus.PENDING,
    externalReferenceId: '111',
    metadata: { existing: true },
    ...payment,
  };
  const deps = {
    getTransactionStatus: async (txref: string) => {
      lookups.push(txref);
      return lookup;
    },
    updatePaymentStatus: async (id: string, status: PaymentStatus, metadata: Record<string, any>) => {
      statusUpdates.push({ id, status, metadata });
      return { ...subject, status };
    },
    updateMetadata: async (id: string, metadata: Record<string, any>) => {
      metadataUpdates.push({ id, metadata });
    },
    now: () => NOW,
  };
  return { subject, deps, statusUpdates, metadataUpdates, lookups };
}

test('extractCallbackTxref reads the common reference fields', () => {
  assert.equal(extractCallbackTxref({ txref: 238909123 }), '238909123');
  assert.equal(extractCallbackTxref({ merchant_trans_id: '55' }), '55');
  assert.equal(extractCallbackTxref({ data: { txref: '77' } }), '77');
  assert.equal(extractCallbackTxref({ other: 'x' }), undefined);
  assert.equal(extractCallbackTxref({ txref: 'bad ref; drop table' }), undefined);
  assert.equal(extractCallbackTxref(undefined), undefined);
});

test('a successful lookup moves a pending payment to SUCCESSFUL', async () => {
  const h = harness(lookupResult('Successful'));
  const result = await reconcileMvendPayment(h.subject, h.deps, {
    source: 'callback',
    callbackPayload: { txref: '111' },
  });

  assert.equal(result.outcome, 'updated');
  assert.deepEqual(h.lookups, ['111']);
  assert.equal(h.statusUpdates.length, 1);
  assert.equal(h.statusUpdates[0].status, PaymentStatus.SUCCESSFUL);
  assert.equal(h.statusUpdates[0].metadata.mvendLastStatus, 'Successful');
  assert.equal(h.statusUpdates[0].metadata.mvendPaymentRef, '306568');
  assert.deepEqual(h.statusUpdates[0].metadata.mvendCallbackPayload, { txref: '111' });
  assert.equal(h.statusUpdates[0].metadata.mvendLastCheckSource, 'callback');
});

test('a failed lookup moves a pending payment to FAILED', async () => {
  const h = harness(lookupResult('Failed'));
  const result = await reconcileMvendPayment(h.subject, h.deps, { source: 'cron' });
  assert.equal(result.outcome, 'updated');
  assert.equal(h.statusUpdates[0].status, PaymentStatus.FAILED);
});

test('a still-pending transaction only refreshes metadata', async () => {
  const h = harness(lookupResult('New'));
  const result = await reconcileMvendPayment(h.subject, h.deps, { source: 'cron' });
  assert.equal(result.outcome, 'unchanged');
  assert.equal(h.statusUpdates.length, 0);
  assert.equal(h.metadataUpdates.length, 1);
  assert.equal(h.metadataUpdates[0].metadata.existing, true);
  assert.equal(h.metadataUpdates[0].metadata.mvendLastStatus, 'New');
});

test('a late pending status never reopens a terminal payment', async () => {
  const h = harness(lookupResult('Pending'), { status: PaymentStatus.SUCCESSFUL });
  const result = await reconcileMvendPayment(h.subject, h.deps, { source: 'callback' });
  assert.equal(result.outcome, 'unchanged');
  assert.equal(h.statusUpdates.length, 0);
});

test('an amount mismatch is flagged and the status left alone', async () => {
  const h = harness(lookupResult('Successful', 50));
  const result = await reconcileMvendPayment(h.subject, h.deps, { source: 'callback' });
  assert.equal(result.outcome, 'amount_mismatch');
  assert.equal(h.statusUpdates.length, 0);
  assert.deepEqual(h.metadataUpdates[0].metadata.mvendAmountMismatch, {
    expected: 2000,
    actual: 50,
    at: NOW.toISOString(),
  });
});

test('a failed lookup records the error without changing status', async () => {
  const h = harness({ success: false, error: { code: MVEND_TIMEOUT, message: 'slow' } });
  const result = await reconcileMvendPayment(h.subject, h.deps, { source: 'cron' });
  assert.equal(result.outcome, 'lookup_failed');
  assert.equal(h.statusUpdates.length, 0);
  assert.equal(h.metadataUpdates[0].metadata.mvendLastLookupError.code, MVEND_TIMEOUT);
});

test('a payment without a txref is skipped', async () => {
  const h = harness(lookupResult('Successful'), { externalReferenceId: null });
  const result = await reconcileMvendPayment(h.subject, h.deps, { source: 'cron' });
  assert.equal(result.outcome, 'missing_reference');
  assert.equal(h.lookups.length, 0);
});

function timeoutHarness(lookup: any, resend: MvendResult) {
  let resends = 0;
  return {
    get resends() {
      return resends;
    },
    deps: {
      getTransactionStatus: async () => lookup,
      resend: async () => {
        resends += 1;
        return resend;
      },
    },
  };
}

test('timeout recovery: an existing transaction is accepted without resending', async () => {
  const h = timeoutHarness(lookupResult('New'), { success: true });
  const result = await recoverMvendTimeout('111', h.deps as any);
  assert.equal(result.outcome, 'accepted');
  assert.equal(h.resends, 0);
});

test('timeout recovery: a missing transaction is resent and a duplicate counts as accepted', async () => {
  const h = timeoutHarness(
    { success: false, error: { code: 'MVEND_105', message: 'Transaction not found' } },
    { success: false, duplicate: true, error: { code: 'MVEND_104', message: 'Duplicate Transaction ID.' } },
  );
  const result = await recoverMvendTimeout('111', h.deps as any);
  assert.equal(result.outcome, 'accepted');
  assert.equal(result.detail.duplicate, true);
  assert.equal(h.resends, 1);
});

test('timeout recovery: an unreachable lookup stays unknown', async () => {
  const h = timeoutHarness({ success: false, error: { code: MVEND_TIMEOUT, message: 'slow' } }, { success: true });
  const result = await recoverMvendTimeout('111', h.deps as any);
  assert.equal(result.outcome, 'unknown');
  assert.equal(h.resends, 0);
});

test('timeout recovery: a rejected resend is a definite failure', async () => {
  const h = timeoutHarness(
    { success: false, error: { code: 'MVEND_105', message: 'Transaction not found' } },
    { success: false, error: { code: 'MVEND_99', message: 'currency is not allowed' } },
  );
  const result = await recoverMvendTimeout('111', h.deps as any);
  assert.equal(result.outcome, 'rejected');
  assert.equal(result.detail.error.message, 'currency is not allowed');
});
