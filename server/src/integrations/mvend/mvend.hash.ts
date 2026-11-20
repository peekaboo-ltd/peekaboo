import crypto from 'crypto';
import { MvendHashFields } from '../../types/mvend.types';

// Order fixed by the MVend Payments docs ("Computing an Integrity Hash").
// appid and appkey never take part in the hash.
const HASH_FIELD_ORDER: (keyof MvendHashFields)[] = [
  'timestamp',
  'txref',
  'amount',
  'currency',
  'payment_account',
  'creditaccount',
  'rollback_txref',
];

export function buildIntegrityString(fields: MvendHashFields): string {
  return HASH_FIELD_ORDER.map((key) => {
    const value = fields[key];
    return value === undefined || value === null ? '' : String(value);
  }).join('');
}

// HMAC-SHA256 of the concatenated fields keyed with the app salt, hex digest.
export function computeIntegrityHash(fields: MvendHashFields, salt: string): string {
  return crypto
    .createHmac('sha256', salt)
    .update(buildIntegrityString(fields))
    .digest('hex');
}
