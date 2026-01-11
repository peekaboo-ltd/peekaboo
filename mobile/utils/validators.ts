/**
 * Validate phone number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Accept 10-12 digit phone numbers
  return cleaned.length >= 10 && cleaned.length <= 12;
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

/**
 * Get password validation error
 */
export const getPasswordError = (password: string): string | null => {
  if (password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

/**
 * Get phone validation error
 */
export const getPhoneError = (phone: string): string | null => {
  if (phone.length === 0) {
    return 'Phone number is required';
  }
  if (!isValidPhoneNumber(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

/**
 * Validate required field
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Get required field error
 */
export const getRequiredError = (value: string, fieldName: string): string | null => {
  if (!isRequired(value)) {
    return `${fieldName} is required`;
  }
  return null;
};
