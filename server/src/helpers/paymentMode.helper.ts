/**
 * Payment modes:
 * - simulate: no provider call; instant SUCCESSFUL (local default)
 * - dev_price: real provider, fixed 100 RWF charge
 * - live: real provider, catalog amount
 *
 * Controlled by PAYMENT_MODE. Defaults to live in production NODE_ENV,
 * otherwise simulate. Production always forces live for non-live modes.
 */

import logger from './logger.helper';

export const DEVELOPMENT_PAYMENT_AMOUNT_RWF = 100;

export type PaymentMode = 'simulate' | 'dev_price' | 'live';

const VALID_MODES = new Set<PaymentMode>(['simulate', 'dev_price', 'live']);

function normalizeMode(value: string | undefined): PaymentMode | undefined {
  const normalized = (value ?? '').trim().toLowerCase();
  if (VALID_MODES.has(normalized as PaymentMode)) {
    return normalized as PaymentMode;
  }
  return undefined;
}

function isProductionNodeEnv(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return (nodeEnv ?? '').toLowerCase() === 'production';
}

/**
 * Resolve the active payment mode.
 * Pass overrides in tests; production always forces live for simulate/dev_price.
 */
export function getPaymentMode(options?: {
  paymentMode?: string;
  nodeEnv?: string;
}): PaymentMode {
  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  const rawMode =
    options?.paymentMode !== undefined
      ? options.paymentMode
      : process.env.PAYMENT_MODE;

  const explicit = normalizeMode(rawMode);
  const fallback: PaymentMode = isProductionNodeEnv(nodeEnv)
    ? 'live'
    : 'simulate';
  const resolved = explicit ?? fallback;

  if (
    isProductionNodeEnv(nodeEnv) &&
    (resolved === 'simulate' || resolved === 'dev_price')
  ) {
    logger.error(
      'PAYMENT_MODE simulate/dev_price is not allowed when NODE_ENV=production; forcing live',
      { requestedMode: resolved },
    );
    return 'live';
  }

  return resolved;
}

export function isPaymentSimulation(options?: {
  paymentMode?: string;
  nodeEnv?: string;
}): boolean {
  return getPaymentMode(options) === 'simulate';
}

export function isDevPriceMode(options?: {
  paymentMode?: string;
  nodeEnv?: string;
}): boolean {
  return getPaymentMode(options) === 'dev_price';
}

export function resolveChargeableAmount(
  catalogAmount: number,
  options?: {
    paymentMode?: string;
    nodeEnv?: string;
  },
): {
  chargeAmount: number;
  isDevPrice: boolean;
  isSimulated: boolean;
  catalogAmount: number;
  mode: PaymentMode;
} {
  const catalog = Number(catalogAmount) || 0;
  const mode = getPaymentMode(options);

  if (mode === 'dev_price') {
    return {
      chargeAmount: DEVELOPMENT_PAYMENT_AMOUNT_RWF,
      isDevPrice: true,
      isSimulated: false,
      catalogAmount: catalog,
      mode,
    };
  }

  return {
    chargeAmount: catalog,
    isDevPrice: false,
    isSimulated: mode === 'simulate',
    catalogAmount: catalog,
    mode,
  };
}
