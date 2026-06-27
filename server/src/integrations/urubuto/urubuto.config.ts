import { PaymentProvider } from '../../types/urubuto.types';
import { UrubutoConfig } from '../../types/urubuto.types';

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

  const isStagingApi = config.baseUrl.includes('staging');
  const isProductionCheckout = config.checkoutBaseUrl.includes('urubutopay.rw') &&
    !config.checkoutBaseUrl.includes('staging');

  if (isStagingApi && isProductionCheckout) {
    issues.push(
      'URUBUTO_BASE_URL points to staging but URUBUTO_CHECKOUT_BASE_URL points to production',
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

  const publicApiBase = process.env.PUBLIC_API_BASE_URL;
  if (!publicApiBase) {
    issues.push(
      'PUBLIC_API_BASE_URL is not set — register webhook URLs with UrubutoPay using this base',
    );
  }

  return issues;
}
