import { PaymentProvider } from '../../types/urubuto.types';
import { UrubutoConfig } from '../../types/urubuto.types';

const PLACEHOLDER_PATTERN = /(your_|_here$|replace_with_|changeme|example)/i;
const TESTING_PATTERN = /(test|sandbox|staging)/i;

export function describeUrubutoEnvironment(url?: string): 'staging' | 'production' | 'unknown' {
  if (!url) return 'unknown';

  const normalized = url.toLowerCase();

  if (normalized.includes('staging') || normalized.includes('sandbox')) {
    return 'staging';
  }

  if (normalized.includes('urubutopay.rw')) {
    return 'production';
  }

  return 'unknown';
}

export function urubutoCredentialFingerprint(value?: string): string {
  if (!value) return 'missing';

  const sanitized = value.trim();
  if (!sanitized) return 'missing';

  if (sanitized.length <= 6) {
    return `${sanitized[0]}***${sanitized[sanitized.length - 1]} (len:${sanitized.length})`;
  }

  return `${sanitized.slice(0, 3)}...${sanitized.slice(-3)} (len:${sanitized.length})`;
}

export function resolveUrubutoCheckoutBaseUrl(
  apiBaseUrl: string,
  override?: string,
): string {
  if (override?.trim()) {
    return override.trim().replace(/\/$/, '');
  }

  if (apiBaseUrl.includes('staging')) {
    return 'https://staging.urubutopay.rw';
  }

  return 'https://urubutopay.rw';
}

export function buildUrubutoConfig(): UrubutoConfig {
  const baseUrl =
    process.env.URUBUTO_BASE_URL || 'https://staging.urubutopay.rw';

  return {
    baseUrl,
    apiKey: process.env.URUBUTO_API_KEY || '',
    merchantCode: process.env.URUBUTO_MERCHANT_CODE || '',
    serviceCode: process.env.URUBUTO_SERVICE_CODE || '',
    webhookUsername: process.env.URUBUTO_WEBHOOK_USERNAME || '',
    webhookPassword: process.env.URUBUTO_WEBHOOK_PASSWORD || '',
    webhookJwtSecret:
      process.env.URUBUTO_WEBHOOK_JWT_SECRET ||
      process.env.JWT_SECRET ||
      'peekaboo',
    checkoutBaseUrl: resolveUrubutoCheckoutBaseUrl(
      baseUrl,
      process.env.URUBUTO_CHECKOUT_BASE_URL,
    ),
  };
}

export function validateUrubutoStartupConfig(
  config: UrubutoConfig = buildUrubutoConfig(),
): string[] {
  const provider = process.env.PAYMENT_PROVIDER_DEFAULT;
  if (provider !== PaymentProvider.URUBUTO && provider !== 'URUBUTO') {
    return [];
  }

  const issues: string[] = [];
  const required: Array<[keyof UrubutoConfig, string]> = [
    ['apiKey', 'URUBUTO_API_KEY'],
    ['merchantCode', 'URUBUTO_MERCHANT_CODE'],
    ['serviceCode', 'URUBUTO_SERVICE_CODE'],
    ['webhookUsername', 'URUBUTO_WEBHOOK_USERNAME'],
    ['webhookPassword', 'URUBUTO_WEBHOOK_PASSWORD'],
  ];

  for (const [key, envName] of required) {
    if (!config[key]) {
      issues.push(`Missing required UrubutoPay env var: ${envName}`);
    }
  }

  const apiEnvironment = describeUrubutoEnvironment(config.baseUrl);
  const checkoutEnvironment = describeUrubutoEnvironment(config.checkoutBaseUrl);
  const isStagingApi = apiEnvironment === 'staging';
  const isProductionApi = apiEnvironment === 'production';
  const isStagingCheckout = checkoutEnvironment === 'staging';
  const isProductionCheckout = checkoutEnvironment === 'production';

  if (isStagingApi && isProductionCheckout) {
    issues.push(
      'URUBUTO_BASE_URL points to staging but URUBUTO_CHECKOUT_BASE_URL points to production',
    );
  }

  if (isProductionApi && isStagingCheckout) {
    issues.push(
      'URUBUTO_BASE_URL points to production but URUBUTO_CHECKOUT_BASE_URL points to staging',
    );
  }

  if (
    config.apiKey &&
    !config.apiKey.startsWith('upg:') &&
    !config.apiKey.includes('test_sk')
  ) {
    issues.push(
      'URUBUTO_API_KEY may be invalid — expected format from UrubutoPay developer menu (e.g. upg:...)',
    );
  }

  if (isProductionApi && TESTING_PATTERN.test(config.apiKey || '')) {
    issues.push(
      'URUBUTO_BASE_URL points to production but URUBUTO_API_KEY looks like a test credential',
    );
  }

  if (PLACEHOLDER_PATTERN.test(config.merchantCode || '')) {
    issues.push(
      'URUBUTO_MERCHANT_CODE looks like a placeholder value. Replace it with the active merchant code from UrubutoPay.',
    );
  }

  if (PLACEHOLDER_PATTERN.test(config.serviceCode || '')) {
    issues.push(
      'URUBUTO_SERVICE_CODE looks like a placeholder value. Replace it with the service code linked to your merchant in UrubutoPay.',
    );
  }

  if (
    config.merchantCode &&
    config.serviceCode &&
    config.merchantCode === config.serviceCode
  ) {
    issues.push(
      'URUBUTO_MERCHANT_CODE and URUBUTO_SERVICE_CODE are identical. Use the service code explicitly linked to the merchant in UrubutoPay.',
    );
  }

  const publicApiBase = process.env.PUBLIC_API_BASE_URL;
  if (!publicApiBase) {
    issues.push(
      'PUBLIC_API_BASE_URL is not set — register webhook URLs with UrubutoPay using this base',
    );
  }

  return issues;
}
