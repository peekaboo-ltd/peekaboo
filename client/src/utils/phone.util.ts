/**
 * Phone Number Validation Utility
 * Validates and formats Rwandan phone numbers
 */

// Valid Rwandan phone number prefixes
const VALID_PREFIXES = ['078', '072', '073', '079', '077'] as const;

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  error?: string;
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

  // Remove all whitespace
  let normalizedNumber = input.replace(/\s/g, '');

  // Check for non-numeric characters (except leading +)
  const hasLeadingPlus = normalizedNumber.startsWith('+');
  const numberWithoutPlus = hasLeadingPlus
    ? normalizedNumber.slice(1)
    : normalizedNumber;

  // Check if the remaining characters are all digits
  if (!/^\d+$/.test(numberWithoutPlus)) {
    return {
      isValid: false,
      error: 'Phone number must contain only digits',
    };
  }

  // Normalize to remove country code prefixes
  if (normalizedNumber.startsWith('+2500')) {
    // Format: +2500788478652 -> 0788478652
    normalizedNumber = normalizedNumber.slice(4);
  } else if (normalizedNumber.startsWith('+250')) {
    // Format: +250788478652 -> 0788478652
    normalizedNumber = '0' + normalizedNumber.slice(4);
  } else if (normalizedNumber.startsWith('2500')) {
    // Format: 2500788478652 -> 0788478652
    normalizedNumber = normalizedNumber.slice(3);
  } else if (normalizedNumber.startsWith('250')) {
    // Format: 250788478652 -> 0788478652
    normalizedNumber = '0' + normalizedNumber.slice(3);
  }
  // If starts with '0', keep as is

  // Validate length - must be exactly 10 digits
  if (normalizedNumber.length !== 10) {
    return {
      isValid: false,
      error: 'Phone number must be 10 digits',
    };
  }

  // Validate prefix
  const prefix = normalizedNumber.slice(0, 3);
  if (!VALID_PREFIXES.includes(prefix as (typeof VALID_PREFIXES)[number])) {
    return {
      isValid: false,
      error: `Invalid phone number prefix. Must start with ${VALID_PREFIXES.join(', ')}`,
    };
  }

  // Ensure the number starts with 0
  if (!normalizedNumber.startsWith('0')) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
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

/**
 * Formats phone number for display purposes
 * @param phoneNumber - A phone number string
 * @returns Formatted string for display (e.g., "078 847 8652")
 */
export function formatPhoneForDisplay(phoneNumber: string | undefined): string {
  if (!phoneNumber) return '';

  const validation = validateAndFormatPhoneNumber(phoneNumber);
  if (!validation.isValid || !validation.formattedNumber) {
    return phoneNumber;
  }

  const num = validation.formattedNumber;
  return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
}
