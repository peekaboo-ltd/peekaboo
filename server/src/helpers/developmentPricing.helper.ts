/**
 * Development pricing: charge a fixed small amount while keeping catalog fees
 * on orders for UI, billing, and analytics.
 *
 * Gated only by NODE_ENV === 'development' (case-insensitive).
 */

export const DEVELOPMENT_PAYMENT_AMOUNT_RWF = 10;

export function isDevelopmentEnvironment(
  env: string | undefined = process.env.NODE_ENV,
): boolean {
  return (env ?? '').toLowerCase() === 'development';
}

export function resolveChargeableAmount(
  catalogAmount: number,
  env?: string,
): {
  chargeAmount: number;
  isDevelopmentPricing: boolean;
  catalogAmount: number;
} {
  const catalog = Number(catalogAmount) || 0;

  if (isDevelopmentEnvironment(env)) {
    return {
      chargeAmount: DEVELOPMENT_PAYMENT_AMOUNT_RWF,
      isDevelopmentPricing: true,
      catalogAmount: catalog,
    };
  }

  return {
    chargeAmount: catalog,
    isDevelopmentPricing: false,
    catalogAmount: catalog,
  };
}
