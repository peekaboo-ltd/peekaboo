import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  isDevelopmentEnvironment,
  resolveChargeableAmount,
} from './developmentPricing.helper';

test('isDevelopmentEnvironment is case-insensitive for development', () => {
  assert.equal(isDevelopmentEnvironment('development'), true);
  assert.equal(isDevelopmentEnvironment('DEVELOPMENT'), true);
  assert.equal(isDevelopmentEnvironment('Development'), true);
});

test('isDevelopmentEnvironment rejects non-development values', () => {
  assert.equal(isDevelopmentEnvironment('production'), false);
  assert.equal(isDevelopmentEnvironment('test'), false);
  assert.equal(isDevelopmentEnvironment(''), false);
  assert.equal(isDevelopmentEnvironment(undefined), false);
});

test('resolveChargeableAmount forces 10 RWF in development', () => {
  const result = resolveChargeableAmount(2500, 'development');
  assert.equal(result.chargeAmount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
  assert.equal(result.chargeAmount, 10);
  assert.equal(result.isDevelopmentPricing, true);
  assert.equal(result.catalogAmount, 2500);
});

test('resolveChargeableAmount forces 10 RWF when env is DEVELOPMENT', () => {
  const result = resolveChargeableAmount(1500, 'DEVELOPMENT');
  assert.equal(result.chargeAmount, 10);
  assert.equal(result.isDevelopmentPricing, true);
  assert.equal(result.catalogAmount, 1500);
});

test('resolveChargeableAmount keeps catalog amount outside development', () => {
  const production = resolveChargeableAmount(2500, 'production');
  assert.equal(production.chargeAmount, 2500);
  assert.equal(production.isDevelopmentPricing, false);
  assert.equal(production.catalogAmount, 2500);

  const undefinedEnv = resolveChargeableAmount(800, undefined);
  assert.equal(undefinedEnv.chargeAmount, 800);
  assert.equal(undefinedEnv.isDevelopmentPricing, false);
});

test('resolveChargeableAmount treats non-numeric catalog as 0', () => {
  const result = resolveChargeableAmount(Number.NaN, 'production');
  assert.equal(result.chargeAmount, 0);
  assert.equal(result.catalogAmount, 0);
});
