import { PaypackConfig, PaypackEnvironment } from '../../types/paypack.types';

export const PAYPACK_DEFAULT_BASE_URL = 'https://payments.paypack.rw/api';

// Minimum cashin amount enforced by Paypack. Charges below this cannot be
// sent to the provider (see PaypackService).
export const PAYPACK_MIN_CASHIN_RWF = 100;

function resolveEnvironment(): PaypackEnvironment {
  const raw = (process.env.PAYPACK_ENV || '').trim().toLowerCase();
  if (raw === 'production' || raw === 'development') {
    return raw;
  }
  return (process.env.NODE_ENV || '').toLowerCase() === 'production'
    ? 'production'
    : 'development';
}

export function buildPaypackConfig(): PaypackConfig {
  return {
    baseUrl: (process.env.PAYPACK_BASE_URL || PAYPACK_DEFAULT_BASE_URL).replace(/\/+$/, ''),
    clientId: process.env.PAYPACK_CLIENT_ID || '',
    clientSecret: process.env.PAYPACK_CLIENT_SECRET || '',
    webhookSecret: process.env.PAYPACK_WEBHOOK_SECRET || '',
    environment: resolveEnvironment(),
  };
}

export function validatePaypackStartupConfig(
  config: PaypackConfig = buildPaypackConfig(),
): string[] {
  const issues: string[] = [];

  if (!config.clientId) {
    issues.push('Missing required Paypack env var: PAYPACK_CLIENT_ID');
  }
  if (!config.clientSecret) {
    issues.push('Missing required Paypack env var: PAYPACK_CLIENT_SECRET');
  }
  if (!config.webhookSecret) {
    issues.push(
      'Missing required Paypack env var: PAYPACK_WEBHOOK_SECRET (needed to verify transaction:processed webhooks)',
    );
  }
  if (!config.baseUrl.startsWith('https://')) {
    issues.push('PAYPACK_BASE_URL must be an https URL');
  }
  if (
    config.environment === 'production' &&
    !process.env.PUBLIC_API_BASE_URL
  ) {
    issues.push(
      'PUBLIC_API_BASE_URL is not set — register the Paypack webhook URL with this base in production mode',
    );
  }

  return issues;
}
