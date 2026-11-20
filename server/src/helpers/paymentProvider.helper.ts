import { PaymentProvider } from '../types/payment-provider.types';

// Gateways that can initiate new payments. Retired providers (URUBUTO, KPAY)
// only exist for historical rows.
const INITIATING_PROVIDERS = [PaymentProvider.MVEND, PaymentProvider.PAYPACK];

// PAYMENT_PROVIDER_DEFAULT picks the gateway for new payments. MVend is the
// default; PAYPACK remains available as a rollback switch until it is removed.
export function getActivePaymentProvider(
  value: string | undefined = process.env.PAYMENT_PROVIDER_DEFAULT,
): PaymentProvider {
  const normalized = (value || '').trim().toUpperCase();
  return (INITIATING_PROVIDERS as string[]).includes(normalized)
    ? (normalized as PaymentProvider)
    : PaymentProvider.MVEND;
}
