import { describe, expect, it } from 'vitest';
import {
  formatPhoneForDisplay,
  normalizePhoneNumber,
  toProviderPhoneNumber,
  validateAndFormatPhoneNumber,
  validateRwandanPhoneNumber,
} from './phone.util';

describe('Rwanda phone utilities', () => {
  it.each([
    '0788 123 456',
    '250788123456',
    '+250 788 123 456',
    '(0788) 123-456',
  ])('normalizes %s to E.164', (value) => {
    const result = validateAndFormatPhoneNumber(value);

    expect(result).toMatchObject({
      isValid: true,
      e164: '+250788123456',
      country: 'RW',
      type: 'MOBILE',
    });
  });

  it('accepts valid Rwanda fixed lines for general telephone fields', () => {
    expect(validateAndFormatPhoneNumber('0250 500 500')).toMatchObject({
      isValid: true,
      e164: '+250250500500',
      type: 'FIXED_LINE',
    });
  });

  it('distinguishes incomplete, invalid, and foreign values', () => {
    expect(validateAndFormatPhoneNumber('0788').error).toBe(
      'Enter a complete Rwandan phone number.',
    );
    expect(validateAndFormatPhoneNumber('0612 345 678').error).toBe(
      'Enter a valid Rwandan phone number.',
    );
    expect(validateAndFormatPhoneNumber('+1 202 456 1414').error).toBe(
      'Only Rwanda (+250) numbers are supported.',
    );
  });

  it('allows an empty optional field but rejects an empty required field', () => {
    expect(validateRwandanPhoneNumber('', false)).toBe(true);
    expect(validateRwandanPhoneNumber('', true)).toBe(
      'Phone number is required.',
    );
  });

  it('formats values only at display and provider boundaries', () => {
    expect(normalizePhoneNumber('0788123456')).toBe('+250788123456');
    expect(formatPhoneForDisplay('0788123456')).toBe('+250 788 123 456');
    expect(toProviderPhoneNumber('+250788123456')).toBe('250788123456');
  });
});
