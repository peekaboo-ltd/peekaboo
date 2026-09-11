// Manual smoke test for the Paypack integration. Read-only by default
// (auth + merchant profile); pass a phone number and amount to also trigger
// a real cashin STK push in development mode.
//
// Usage:
//   PAYPACK_CLIENT_ID=... PAYPACK_CLIENT_SECRET=... npm run paypack:smoke-test
//   ... npm run paypack:smoke-test -- 0788123456 100
import 'dotenv/config';
import { PaypackService } from '../integrations/paypack/paypack.service';
import { buildPaypackConfig } from '../integrations/paypack/paypack.config';
import { formatPhoneForPaypack } from '../helpers/phone.helper';
import { PaymentCurrency } from '../types/payment-status.types';
import { PaypackChannel } from '../types/paypack.types';
import { UUID } from '../types';

async function main(): Promise<void> {
  const config = buildPaypackConfig();
  console.log(`Paypack environment: ${config.environment} (${config.baseUrl})`);

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Set PAYPACK_CLIENT_ID and PAYPACK_CLIENT_SECRET first');
  }

  const service = new PaypackService(config);
  const me = await service.listTransactions({ limit: 1, offset: 0 });
  console.log('transactions/list reachable:', me.success);

  const [phoneArg, amountArg] = process.argv.slice(2);
  if (!phoneArg || !amountArg) {
    console.log('Skipping cashin (pass <phone> <amount> to trigger an STK push)');
    return;
  }

  if (config.environment !== 'development') {
    throw new Error('Refusing to cashin outside development mode');
  }

  const number = formatPhoneForPaypack(phoneArg);
  if (!number) throw new Error(`Invalid Rwandan phone number: ${phoneArg}`);

  const result = await service.cashin({
    amount: Number(amountArg),
    currency: PaymentCurrency.RWF,
    customerPhone: number,
    refId: 'smoke-test' as UUID,
    idempotencyKey: `smoke${Date.now().toString(36)}`.padEnd(32, '0').slice(0, 32),
    channel: PaypackChannel.MOMO,
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error?.response?.data || error?.message || error);
  process.exit(1);
});
