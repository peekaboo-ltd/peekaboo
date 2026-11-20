import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  getPaymentMode,
  isDevPriceMode,
  isPaymentSimulation,
  resolveChargeableAmount,
} from './paymentMode.helper';

test('getPaymentMode defaults to simulate outside production when unset', () => {
  assert.equal(getPaymentMode({ paymentMode: '', nodeEnv: 'development' }), 'simulate');
  assert.equal(getPaymentMode({ paymentMode: undefined, nodeEnv: 'test' }), 'simulate');
});

test('getPaymentMode defaults to live in production when unset', () => {
  assert.equal(getPaymentMode({ paymentMode: '', nodeEnv: 'production' }), 'live');
  assert.equal(getPaymentMode({ paymentMode: undefined, nodeEnv: 'production' }), 'live');
});

test('getPaymentMode is case-insensitive for valid modes', () => {
  assert.equal(getPaymentMode({ paymentMode: 'SIMULATE', nodeEnv: 'development' }), 'simulate');
  assert.equal(getPaymentMode({ paymentMode: 'Dev_Price', nodeEnv: 'development' }), 'dev_price');
  assert.equal(getPaymentMode({ paymentMode: 'LIVE', nodeEnv: 'development' }), 'live');
});

test('getPaymentMode forces live in production for simulate and dev_price', () => {
  assert.equal(getPaymentMode({ paymentMode: 'simulate', nodeEnv: 'production' }), 'live');
  assert.equal(getPaymentMode({ paymentMode: 'dev_price', nodeEnv: 'PRODUCTION' }), 'live');
});

test('isPaymentSimulation and isDevPriceMode reflect resolved mode', () => {
  assert.equal(isPaymentSimulation({ paymentMode: 'simulate', nodeEnv: 'development' }), true);
  assert.equal(isPaymentSimulation({ paymentMode: 'live', nodeEnv: 'development' }), false);
  assert.equal(isDevPriceMode({ paymentMode: 'dev_price', nodeEnv: 'development' }), true);
  assert.equal(isDevPriceMode({ paymentMode: 'simulate', nodeEnv: 'production' }), false);
});

test('resolveChargeableAmount uses 100 RWF only in dev_price', () => {
  const result = resolveChargeableAmount(2500, {
    paymentMode: 'dev_price',
    nodeEnv: 'development',
  });
  assert.equal(result.chargeAmount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
  assert.equal(result.isDevPrice, true);
  assert.equal(result.isSimulated, false);
  assert.equal(result.catalogAmount, 2500);
  assert.equal(result.mode, 'dev_price');
});

test('resolveChargeableAmount keeps catalog for simulate and live', () => {
  const simulated = resolveChargeableAmount(2500, {
    paymentMode: 'simulate',
    nodeEnv: 'development',
  });
  assert.equal(simulated.chargeAmount, 2500);
  assert.equal(simulated.isSimulated, true);
  assert.equal(simulated.isDevPrice, false);
  assert.equal(simulated.mode, 'simulate');

  const live = resolveChargeableAmount(2500, {
    paymentMode: 'live',
    nodeEnv: 'production',
  });
  assert.equal(live.chargeAmount, 2500);
  assert.equal(live.isSimulated, false);
  assert.equal(live.isDevPrice, false);
  assert.equal(live.mode, 'live');
});

test('resolveChargeableAmount treats non-numeric catalog as 0', () => {
  const result = resolveChargeableAmount(Number.NaN, {
    paymentMode: 'live',
    nodeEnv: 'production',
  });
  assert.equal(result.chargeAmount, 0);
  assert.equal(result.catalogAmount, 0);
});
