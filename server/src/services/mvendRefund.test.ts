import test from 'node:test';
import assert from 'node:assert/strict';
import { PaymentStatus } from '../types/payment-status.types';
import { PaymentProvider } from '../types/payment-provider.types';
import { assertRefundable } from './mvendRefund';

const base = {
  provider: PaymentProvider.MVEND,
  status: PaymentStatus.SUCCESSFUL,
  amount: '2500.00',
  externalReferenceId: '111',
  customerPhone: '+250788318046',
  metadata: {},
};

test('rollback refunds the full amount', () => {
  assert.equal(assertRefundable(base, 'rollback'), 2500);
  assert.throws(() => assertRefundable(base, 'rollback', 100), /full amount/);
});

test('credit allows partial refunds up to the amount paid', () => {
  assert.equal(assertRefundable(base, 'credit'), 2500);
  assert.equal(assertRefundable(base, 'credit', 1000), 1000);
  assert.throws(() => assertRefundable(base, 'credit', 3000), /exceed/);
  assert.throws(() => assertRefundable(base, 'credit', 0), /positive/);
  assert.throws(() => assertRefundable({ ...base, customerPhone: null }, 'credit'), /phone/);
});

test('only successful MVend payments are refundable', () => {
  assert.throws(() => assertRefundable({ ...base, provider: PaymentProvider.PAYPACK }, 'rollback'), /MVend/);
  assert.throws(() => assertRefundable({ ...base, status: PaymentStatus.PENDING }, 'rollback'), /successful/);
  assert.throws(() => assertRefundable({ ...base, externalReferenceId: null }, 'rollback'), /reference/);
});

test('a refund can only be retried after a definite failure', () => {
  const withRefund = (state: string) => ({
    ...base,
    metadata: { mvendRefund: { state, method: 'rollback', txref: '1', amount: 2500, requestedAt: '' } },
  });
  assert.throws(() => assertRefundable(withRefund('requested'), 'rollback'), /already/);
  assert.throws(() => assertRefundable(withRefund('accepted'), 'credit'), /already/);
  assert.throws(() => assertRefundable(withRefund('unknown'), 'rollback'), /timed out/);
  assert.equal(assertRefundable(withRefund('failed'), 'rollback'), 2500);
});
