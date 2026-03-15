import { PricingConfig, PricingTier, TierBreakdown } from '../constants/businessPlan.constants';

/**
 * Calculate the price for the next order based on the current order count
 * and the plan's pricing configuration.
 */
export function calculateOrderPrice(
  config: PricingConfig,
  currentOrderCount: number
): number {
  const orderPosition = currentOrderCount + 1;
  const tier = findTierForQuantity(config.tiers, orderPosition);

  if (!tier) {
    // Beyond all defined tiers — use overflow rate
    return config.overflowRate ?? 0;
  }

  if (tier.isCustom) {
    // Custom tier — use overflow rate as fallback
    return config.overflowRate ?? 0;
  }

  if (tier.pricePerUnit != null) {
    return tier.pricePerUnit;
  }

  if (tier.totalPrice != null) {
    // Package pricing — derive per-unit from the package
    const tierSize = (tier.maxQuantity ?? tier.minQuantity) - tier.minQuantity + 1;
    return tierSize > 0 ? tier.totalPrice / tierSize : tier.totalPrice;
  }

  return config.overflowRate ?? 0;
}

/**
 * Calculate the total billing amount for a given number of orders,
 * walking through all tiers and allocating orders to each.
 */
export function calculateBillingTotal(
  config: PricingConfig,
  totalOrders: number
): { breakdown: TierBreakdown[]; total: number } {
  const breakdown: TierBreakdown[] = [];
  let remainingOrders = totalOrders;
  let total = 0;

  // Sort tiers by minQuantity ascending
  const sortedTiers = [...config.tiers]
    .filter((t) => !t.isCustom)
    .sort((a, b) => a.minQuantity - b.minQuantity);

  for (const tier of sortedTiers) {
    if (remainingOrders <= 0) break;

    const tierMin = tier.minQuantity;
    const tierMax = tier.maxQuantity;
    const tierCapacity = tierMax != null ? tierMax - tierMin + 1 : remainingOrders;
    const ordersInTier = Math.min(remainingOrders, tierCapacity);

    if (tier.pricePerUnit != null) {
      // Per-unit pricing: charge per delivery
      const subtotal = ordersInTier * tier.pricePerUnit;
      breakdown.push({
        tierLabel: tier.label ?? `${tierMin}–${tierMax ?? '∞'}`,
        quantity: ordersInTier,
        unitPrice: tier.pricePerUnit,
        subtotal,
      });
      total += subtotal;
    } else if (tier.totalPrice != null) {
      // Package pricing: flat charge for the tier
      breakdown.push({
        tierLabel: tier.label ?? `${tierMin}–${tierMax ?? '∞'}`,
        quantity: ordersInTier,
        unitPrice: ordersInTier > 0 ? tier.totalPrice / ordersInTier : 0,
        subtotal: tier.totalPrice,
      });
      total += tier.totalPrice;
    }

    remainingOrders -= ordersInTier;
  }

  // Handle overflow orders beyond all defined tiers
  if (remainingOrders > 0 && config.overflowRate) {
    const subtotal = remainingOrders * config.overflowRate;
    breakdown.push({
      tierLabel: 'Extra deliveries',
      quantity: remainingOrders,
      unitPrice: config.overflowRate,
      subtotal,
    });
    total += subtotal;
  }

  return { breakdown, total };
}

/**
 * Find the tier that contains the given quantity position.
 */
function findTierForQuantity(
  tiers: PricingTier[],
  quantity: number
): PricingTier | undefined {
  return tiers.find((tier) => {
    const inMin = quantity >= tier.minQuantity;
    const inMax = tier.maxQuantity == null || quantity <= tier.maxQuantity;
    return inMin && inMax;
  });
}

/**
 * Validate pricing tiers configuration.
 * Returns an array of error messages (empty if valid).
 */
export function validatePricingTiers(config: PricingConfig): string[] {
  const errors: string[] = [];

  if (!config.tiers || config.tiers.length === 0) {
    errors.push('At least one pricing tier is required.');
    return errors;
  }

  const sorted = [...config.tiers].sort((a, b) => a.minQuantity - b.minQuantity);

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];

    if (tier.minQuantity < 0) {
      errors.push(`Tier ${i + 1}: minQuantity must be >= 0.`);
    }

    if (tier.maxQuantity != null && tier.maxQuantity < tier.minQuantity) {
      errors.push(`Tier ${i + 1}: maxQuantity must be >= minQuantity.`);
    }

    if (!tier.isCustom && tier.pricePerUnit == null && tier.totalPrice == null) {
      errors.push(`Tier ${i + 1}: must have either pricePerUnit or totalPrice.`);
    }

    // Check for overlap with next tier
    if (i < sorted.length - 1) {
      const nextTier = sorted[i + 1];
      if (tier.maxQuantity != null && nextTier.minQuantity <= tier.maxQuantity) {
        errors.push(
          `Tiers ${i + 1} and ${i + 2} overlap: maxQuantity ${tier.maxQuantity} >= next minQuantity ${nextTier.minQuantity}.`
        );
      }
    }
  }

  return errors;
}
