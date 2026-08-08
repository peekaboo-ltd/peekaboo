import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatPhoneForProvider,
  normalizePhoneNumber,
  validateAndFormatPhoneNumber,
} from './phone.helper';

describe('Rwanda phone helper', () => {
  it('normalizes supported Rwanda representations to E.164', () => {
    for (const value of [
      '0788 123 456',
      '250788123456',
      '+250 788 123 456',
      '(0788) 123-456',
    ]) {
      assert.deepEqual(validateAndFormatPhoneNumber(value), {
        isValid: true,
        e164: '+250788123456',
        national: '0788 123 456',
        international: '+250 788 123 456',
        country: 'RW',
        type: 'MOBILE',
      });
    }
  });

  it('accepts valid fixed lines generally', () => {
    assert.deepEqual(validateAndFormatPhoneNumber('0250 500 500'), {
      isValid: true,
      e164: '+250250500500',
      national: '250 500 500',
      international: '+250 250 500 500',
      country: 'RW',
      type: 'FIXED_LINE',
    });
  });

  it('rejects incomplete, invalid, and foreign values', () => {
    assert.equal(
      validateAndFormatPhoneNumber('0788').error,
      'Enter a complete Rwandan phone number.',
    );
    assert.equal(
      validateAndFormatPhoneNumber('0612 345 678').error,
      'Enter a valid Rwandan phone number.',
    );
    assert.equal(
      validateAndFormatPhoneNumber('+1 202 456 1414').error,
      'Only Rwanda (+250) numbers are supported.',
    );
  });

  it('converts to provider digits only at an adapter boundary', () => {
    assert.equal(normalizePhoneNumber('0788123456'), '+250788123456');
    assert.equal(formatPhoneForProvider('+250 788 123 456'), '250788123456');
  });
});
