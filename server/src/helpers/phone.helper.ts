import {
  isPossiblePhoneNumber,
  isValidPhoneNumber as isValidPhoneNumberValue,
  parsePhoneNumber,
  type CountryCode,
  type PhoneNumberType,
} from 'libphonenumber-js/max';
import { COUNTRIES } from '../constants/countries.constants';

export const SUPPORTED_PHONE_COUNTRY = 'RW' as const satisfies CountryCode;

const rwandaCountry = COUNTRIES.find(
  (country) => country.code === SUPPORTED_PHONE_COUNTRY,
);

if (!rwandaCountry) {
  throw new Error('Rwanda is missing from COUNTRIES');
}

export const RWANDA_COUNTRY = rwandaCountry;

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string;
  national?: string;
  international?: string;
  country?: CountryCode;
  type?: PhoneNumberType;
  error?: string;
}

const requiredError = 'Phone number is required.';
const invalidError = 'Enter a valid Rwandan phone number.';
const incompleteError = 'Enter a complete Rwandan phone number.';
const foreignCountryError = `Only Rwanda (${RWANDA_COUNTRY.dial_code}) numbers are supported.`;

export function validateAndFormatPhoneNumber(
  input: string | null | undefined,
): PhoneValidationResult {
  const value = input?.trim();

  if (!value) {
    return { isValid: false, error: requiredError };
  }

  try {
    const phoneNumber = parsePhoneNumber(value, SUPPORTED_PHONE_COUNTRY);

    if (phoneNumber.country !== SUPPORTED_PHONE_COUNTRY) {
      return {
        isValid: false,
        country: phoneNumber.country,
        error: foreignCountryError,
      };
    }

    if (!isPossiblePhoneNumber(phoneNumber.number)) {
      return {
        isValid: false,
        country: phoneNumber.country,
        error: incompleteError,
      };
    }

    if (!isValidPhoneNumberValue(phoneNumber.number)) {
      return {
        isValid: false,
        country: phoneNumber.country,
        error: invalidError,
      };
    }

    return {
      isValid: true,
      e164: phoneNumber.number,
      national: phoneNumber.formatNational(),
      international: phoneNumber.formatInternational(),
      country: phoneNumber.country,
      type: phoneNumber.getType(),
    };
  } catch {
    return {
      isValid: false,
      error: value.startsWith('+') && !value.startsWith(RWANDA_COUNTRY.dial_code)
        ? foreignCountryError
        : incompleteError,
    };
  }
}

export function normalizePhoneNumber(
  input: string | null | undefined,
): string | null {
  return validateAndFormatPhoneNumber(input).e164 ?? null;
}

export function isValidPhoneNumber(
  input: string | null | undefined,
): boolean {
  return validateAndFormatPhoneNumber(input).isValid;
}

export function formatPhoneNumber(
  input: string | null | undefined,
): string | null {
  return normalizePhoneNumber(input);
}

export function formatPhoneForProvider(
  input: string | null | undefined,
): string | null {
  const e164 = normalizePhoneNumber(input);
  return e164 ? e164.slice(1) : null;
}

// Paypack cashin expects the local MSISDN form (078xxxxxxx).
export function formatPhoneForPaypack(
  input: string | null | undefined,
): string | null {
  const e164 = normalizePhoneNumber(input);
  if (!e164 || !e164.startsWith(RWANDA_COUNTRY.dial_code)) return null;
  return `250${e164.slice(RWANDA_COUNTRY.dial_code.length)}`;
}
