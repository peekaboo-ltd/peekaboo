import test from 'node:test';
import assert from 'node:assert/strict';
import { getActivePaymentProvider } from './paymentProvider.helper';
import { PaymentProvider } from '../types/payment-provider.types';

test('getActivePaymentProvider defaults to MVEND', () => {
  assert.equal(getActivePaymentProvider(undefined), PaymentProvider.MVEND);
  assert.equal(getActivePaymentProvider(''), PaymentProvider.MVEND);
  assert.equal(getActivePaymentProvider('URUBUTO'), PaymentProvider.MVEND);
});

test('getActivePaymentProvider accepts PAYPACK case-insensitively', () => {
  assert.equal(getActivePaymentProvider('paypack'), PaymentProvider.PAYPACK);
  assert.equal(getActivePaymentProvider(' MVEND '), PaymentProvider.MVEND);
});
