export const validatePasswordStrength = (password?: string): string | null => {
  const value = (password ?? '').trim();

  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters long';

  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
    return 'Password must include uppercase, lowercase, a number, and a symbol';
  }

  return null;
};

