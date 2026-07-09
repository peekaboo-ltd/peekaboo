import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeUrubutoEnvironment,
  urubutoCredentialFingerprint,
  validateUrubutoStartupConfig,
} from './urubuto.config';

const originalEnv = { ...process.env };

test('describeUrubutoEnvironment maps known base URLs', () => {
  assert.equal(
    describeUrubutoEnvironment('https://staging.urubutopay.rw'),
    'staging',
  );
  assert.equal(
    describeUrubutoEnvironment('https://urubutopay.rw'),
    'production',
  );
  assert.equal(describeUrubutoEnvironment('https://example.test'), 'unknown');
});

test('urubutoCredentialFingerprint does not expose full credential', () => {
  const fingerprint = urubutoCredentialFingerprint('SERVICE-CODE-12345');
  assert.equal(fingerprint.includes('SERVICE-CODE-12345'), false);
  assert.match(fingerprint, /\(len:\d+\)/);
});

test('validateUrubutoStartupConfig flags production API with staging checkout', () => {
  process.env.PAYMENT_PROVIDER_DEFAULT = 'URUBUTO';
  process.env.PUBLIC_API_BASE_URL = 'https://server.peekaboo.co.rw';

  const issues = validateUrubutoStartupConfig({
    baseUrl: 'https://urubutopay.rw',
    checkoutBaseUrl: 'https://staging.urubutopay.rw',
    apiKey: 'upg:live_sk',
    merchantCode: 'MERCHANT123',
    serviceCode: 'SERVICE123',
    webhookUsername: 'webhook',
    webhookPassword: 'password',
    webhookJwtSecret: 'jwt-secret',
  });

  assert.equal(
    issues.some((issue) =>
      issue.includes(
        'URUBUTO_BASE_URL points to production but URUBUTO_CHECKOUT_BASE_URL points to staging',
      ),
    ),
    true,
  );
});

test('validateUrubutoStartupConfig flags placeholder service code', () => {
  process.env.PAYMENT_PROVIDER_DEFAULT = 'URUBUTO';
  process.env.PUBLIC_API_BASE_URL = 'https://server.peekaboo.co.rw';

  const issues = validateUrubutoStartupConfig({
    baseUrl: 'https://staging.urubutopay.rw',
    checkoutBaseUrl: 'https://staging.urubutopay.rw',
    apiKey: 'upg:test_sk_key',
    merchantCode: 'merchant_123',
    serviceCode: 'your_urubuto_service_code_here',
    webhookUsername: 'webhook',
    webhookPassword: 'password',
    webhookJwtSecret: 'jwt-secret',
  });

  assert.equal(
    issues.some((issue) => issue.includes('URUBUTO_SERVICE_CODE looks like a placeholder value')),
    true,
  );
});

test.after(() => {
  process.env = originalEnv;
});
