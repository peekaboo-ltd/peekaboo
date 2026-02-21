const SENSITIVE_FIELDS = [
  'passwordHash',
  'password',
  'token',
  'secret',
  'accessToken',
  'refreshToken',
];

/**
 * Strip sensitive fields from an object before persisting to the audit log.
 */
export function sanitizeAuditValues(
  values: Record<string, any> | null | undefined,
): Record<string, any> {
  if (!values || typeof values !== 'object') return {};

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(values)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
