const nodeEnvironment =
  import.meta.env.VITE_NODE_ENVIRONMENT || import.meta.env.MODE || '';

type PaymentMode = 'simulate' | 'dev_price' | 'live';

const VALID_PAYMENT_MODES = new Set<PaymentMode>([
  'simulate',
  'dev_price',
  'live',
]);

function resolveClientPaymentMode(): PaymentMode {
  const raw = (
    import.meta.env.VITE_PAYMENT_MODE ||
    ''
  )
    .trim()
    .toLowerCase();

  if (VALID_PAYMENT_MODES.has(raw as PaymentMode)) {
    return raw as PaymentMode;
  }

  // Align with Vite MODE: production → live, otherwise simulate
  return import.meta.env.MODE === 'production' ? 'live' : 'simulate';
}

const paymentMode = resolveClientPaymentMode();

export const ENVIRONMENTS = {
  API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  inactivityTimeout: import.meta.env.VITE_INACTIVITY_TIMEOUT || '5', // in minutes
  /** Optional override; falls back to Vite MODE (development | production). */
  NODE_ENVIRONMENT: nodeEnvironment,
  paymentMode,
  isPaymentSimulation: paymentMode === 'simulate',
  isDevPrice: paymentMode === 'dev_price',
};

/** Fixed checkout amount charged in dev_price mode (server is source of truth). */
export const DEVELOPMENT_PAYMENT_AMOUNT_RWF = 10;
