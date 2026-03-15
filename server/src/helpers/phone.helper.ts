/**
 * Phone Number Validation Helper
 * Validates and formats Rwandan phone numbers
 */

// Valid Rwandan phone number prefixes
const VALID_PREFIXES = ['078', '072', '073', '079', '077'] as const;

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  error?: string;
}

function normalizeRwandaPhoneNumber(
  input: string | null | undefined
): string | null {
  if (!input) {
    return null;
  }

  let normalizedNumber = input.replace(/\s/g, '');
  const hasLeadingPlus = normalizedNumber.startsWith('+');
  const numberWithoutPlus = hasLeadingPlus
    ? normalizedNumber.slice(1)
    : normalizedNumber;

  if (!/^\d+$/.test(numberWithoutPlus)) {
    return null;
  }

  if (normalizedNumber.startsWith('+2500')) {
    normalizedNumber = normalizedNumber.slice(4);
  } else if (normalizedNumber.startsWith('+250')) {
    normalizedNumber = '0' + normalizedNumber.slice(4);
  } else if (normalizedNumber.startsWith('2500')) {
    normalizedNumber = normalizedNumber.slice(3);
  } else if (normalizedNumber.startsWith('250')) {
    normalizedNumber = '0' + normalizedNumber.slice(3);
  }

  if (normalizedNumber.length !== 10) {
    return null;
  }

  const prefix = normalizedNumber.slice(0, 3);
  if (!VALID_PREFIXES.includes(prefix as (typeof VALID_PREFIXES)[number])) {
    return null;
  }

  if (!normalizedNumber.startsWith('0')) {
    return null;
  }

  return normalizedNumber;
}

/**
 * Validates and formats a phone number to local format (0XXXXXXXXX)
 *
 * Accepts formats:
 * - 0788478652 (local format - already correct)
 * - 250788478652 (with country code)
 * - +250788478652 (with + and country code)
 * - +2500788478652 (with + and country code including leading 0)
 *
 * @param input - The phone number to validate and format
 * @returns PhoneValidationResult with isValid, formattedNumber, and error
 */
export function validateAndFormatPhoneNumber(
  input: string | null | undefined
): PhoneValidationResult {
  // Handle null/undefined
  if (!input) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  // Check for non-numeric characters (except leading +)
  const normalizedInput = input.replace(/\s/g, '');
  const hasLeadingPlus = normalizedInput.startsWith('+');
  const numberWithoutPlus = hasLeadingPlus
    ? normalizedInput.slice(1)
    : normalizedInput;

  if (!/^\d+$/.test(numberWithoutPlus)) {
    return {
      isValid: false,
      error: 'Phone number must contain only digits',
    };
  }

  const normalizedNumber = normalizeRwandaPhoneNumber(input);

  if (!normalizedNumber) {
    return {
      isValid: false,
      error: `Invalid phone number. Must be a valid Rwandan mobile number starting with ${VALID_PREFIXES.join(', ')}`,
    };
  }

  return {
    isValid: true,
    formattedNumber: normalizedNumber,
  };
}

/**
 * Quick validation check without formatting
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(
  phoneNumber: string | null | undefined
): boolean {
  return validateAndFormatPhoneNumber(phoneNumber).isValid;
}

export function formatPhoneNumber(
  input: string | null | undefined
): string | null {
  const normalizedNumber = normalizeRwandaPhoneNumber(input);

  if (!normalizedNumber) {
    return null;
  }

  return `+250${normalizedNumber.slice(-9)}`;
}

/**
 * Gets the carrier name based on phone number prefix
 * @param phoneNumber - A validated phone number
 * @returns The carrier name or undefined if unknown
 */
export function getCarrierFromPrefix(
  phoneNumber: string
): string | undefined {
  const validation = validateAndFormatPhoneNumber(phoneNumber);
  if (!validation.isValid || !validation.formattedNumber) {
    return undefined;
  }

  const prefix = validation.formattedNumber.slice(0, 3);

  const carrierMap: Record<string, string> = {
    '078': 'MTN',
    '079': 'MTN',
    '072': 'Airtel',
    '073': 'Airtel',
    '077': 'Tigo',
  };

  return carrierMap[prefix];
}
