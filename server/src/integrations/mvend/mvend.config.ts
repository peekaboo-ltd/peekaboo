import { MvendConfig } from '../../types/mvend.types';

export const MVEND_QA_BASE_URL = 'https://qa.mvendpay.com';
export const MVEND_LIVE_BASE_URL = 'https://live.mvendpay.com';
export const MVEND_DEFAULT_PAYMENTS_PATH = '/mpay/requestpayment';
export const MVEND_CALLBACK_ROUTE = '/api/v1/webhooks/mvend';

// Smallest debit we send to MVend; smaller charges complete as simulated.
export const MVEND_MIN_DEBIT_RWF = 100;

function readBool(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase());
}

function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function buildMvendConfig(): MvendConfig {
  return {
    baseUrl: (process.env.MVEND_BASE_URL || MVEND_QA_BASE_URL).replace(/\/+$/, ''),
    paymentsPath: normalizePath(process.env.MVEND_PAYMENTS_PATH || MVEND_DEFAULT_PAYMENTS_PATH),
    appId: (process.env.MVEND_APP_ID || '').trim(),
    appKey: (process.env.MVEND_APP_KEY || '').trim(),
    salt: process.env.MVEND_SALT || '',
    currency: (process.env.MVEND_CURRENCY || 'RWF').trim().toUpperCase(),
    useTokenAuth: readBool(process.env.MVEND_USE_TOKEN_AUTH),
    authString: process.env.MVEND_AUTH_STRING || '',
    callbackToken: process.env.MVEND_CALLBACK_TOKEN || '',
  };
}

export function buildMvendCallbackUrl(
  config: MvendConfig = buildMvendConfig(),
  publicBaseUrl: string | undefined = process.env.PUBLIC_API_BASE_URL,
): string | undefined {
  if (!publicBaseUrl || !config.callbackToken) return undefined;
  return `${publicBaseUrl.replace(/\/+$/, '')}${MVEND_CALLBACK_ROUTE}/${encodeURIComponent(
    config.callbackToken,
  )}`;
}

export function validateMvendStartupConfig(
  config: MvendConfig = buildMvendConfig(),
): string[] {
  const issues: string[] = [];

  if (!config.appId) issues.push('Missing required MVend env var: MVEND_APP_ID');
  if (!config.appKey) issues.push('Missing required MVend env var: MVEND_APP_KEY');
  if (!config.salt) {
    issues.push('Missing required MVend env var: MVEND_SALT (signs integrity_hash)');
  }
  if (!config.callbackToken || config.callbackToken.length < 24) {
    issues.push(
      'MVEND_CALLBACK_TOKEN must be set to a random string of at least 24 characters (authenticates the payment callback URL)',
    );
  }
  if (config.useTokenAuth && !config.authString) {
    issues.push('MVEND_USE_TOKEN_AUTH is on but MVEND_AUTH_STRING is not set');
  }
  if (!config.baseUrl.startsWith('https://')) {
    issues.push('MVEND_BASE_URL must be an https URL');
  }
  if (!process.env.PUBLIC_API_BASE_URL) {
    issues.push(
      'PUBLIC_API_BASE_URL is not set — the MVend callback URL registered on MPS is built from it',
    );
  }

  return issues;
}
