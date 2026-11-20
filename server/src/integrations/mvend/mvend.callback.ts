import crypto from 'crypto';

// Constant-time comparison of the callback URL token. Both sides are hashed
// first so the comparison does not leak the expected token's length.
export function isValidCallbackToken(provided: string | undefined, expected: string): boolean {
  if (!provided || !expected) return false;
  const digest = (value: string) => crypto.createHash('sha256').update(value).digest();
  return crypto.timingSafeEqual(digest(provided), digest(expected));
}
