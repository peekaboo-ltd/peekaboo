// Manual smoke test for the MVend Payments integration. Read-only by default
// (merchant balance); pass a phone number and amount to also send a real
// debit request and poll its status.
//
// Usage:
//   MVEND_APP_ID=... MVEND_APP_KEY=... MVEND_SALT=... npm run mvend:smoke-test
//   ... npm run mvend:smoke-test -- 0788123456 100
import 'dotenv/config';
import { MvendService, generateMvendTxref } from '../integrations/mvend/mvend.service';
import {
  buildMvendCallbackUrl,
  buildMvendConfig,
  MVEND_LIVE_BASE_URL,
} from '../integrations/mvend/mvend.config';
import { formatPhoneForPaypack } from '../helpers/phone.helper';
import { PaymentStatus } from '../types/payment-status.types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  const config = buildMvendConfig();
  console.log(`MVend endpoint: ${config.baseUrl}${config.paymentsPath}`);
  console.log(`Callback URL to register on MPS: ${buildMvendCallbackUrl(config) ?? '(set PUBLIC_API_BASE_URL and MVEND_CALLBACK_TOKEN)'}`);

  const service = new MvendService(config);
  if (!service.isConfigured()) {
    throw new Error('Set MVEND_APP_ID, MVEND_APP_KEY and MVEND_SALT first');
  }

  const balance = await service.getAccountBalance();
  console.log('getaccountbalance:', JSON.stringify(balance, null, 2));

  const [phoneArg, amountArg] = process.argv.slice(2);
  if (!phoneArg || !amountArg) {
    console.log('Skipping debit (pass <phone> <amount> to send a payment request)');
    return;
  }

  if (config.baseUrl === MVEND_LIVE_BASE_URL) {
    throw new Error('Refusing to send a debit against the live host');
  }

  const msisdn = formatPhoneForPaypack(phoneArg);
  if (!msisdn) throw new Error(`Invalid Rwandan phone number: ${phoneArg}`);

  const txref = generateMvendTxref();
  const debit = await service.requestPayment({ txref, amount: Number(amountArg), paymentAccount: msisdn });
  console.log(`paymentrequest txref=${txref}:`, JSON.stringify(debit, null, 2));
  if (!debit.success) return;

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    await sleep(10_000);
    const status = await service.getTransactionStatus(txref);
    console.log(`#${attempt} status:`, status.status?.rawStatus ?? status.error?.message);
    if (status.status && status.status.status !== PaymentStatus.PENDING) {
      console.log(JSON.stringify(status.status.raw, null, 2));
      return;
    }
  }
}

main().catch((error) => {
  console.error(error?.response?.data || error?.message || error);
  process.exit(1);
});
