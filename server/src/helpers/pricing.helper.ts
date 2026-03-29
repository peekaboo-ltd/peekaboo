import {
  PricingConfig,
  PricingTier,
  TierBreakdown,
} from "../constants/businessPlan.constants";

/**
 * Calculate the price for the next order based on the current order count
 * and the plan's pricing configuration.
 * For package tiers (totalPrice), the fallback rate is returned when
 * the tier is only partially filled. The full package rate applies
 * only when the tier is completely filled.
 */
export function calculateOrderPrice(
  config: PricingConfig,
  currentOrderCount: number,
): number {
  const orderPosition = currentOrderCount + 1;
  const sortedTiers = getSortedTiers(config.tiers);

  for (const tier of sortedTiers) {
    if (tier.maxQuantity != null && orderPosition > tier.maxQuantity) {
      continue;
    }

    if (tier.pricePerUnit != null) {
      return tier.pricePerUnit;
    }

    if (tier.totalPrice != null) {
      return config.fallbackRate ?? 0;
    }
  }

  return config.overflowRate ?? 0;
}

/**
 * Calculate the total billing amount for a given number of orders,
 * walking through all tiers and allocating orders to each.
 * For package tiers (totalPrice):
 *   - If all orders in the tier are filled → charge the full package price
 *   - If only partially filled → charge each order at fallbackRate
 * For per-unit tiers (pricePerUnit): unchanged behaviour.
 */
export function calculateBillingTotal(
  config: PricingConfig,
  totalOrders: number,
): { breakdown: TierBreakdown[]; total: number } {
  const breakdown: TierBreakdown[] = [];
  let total = 0;
  let previousThreshold = 0;
  let lastThreshold = 0;

  for (const tier of getSortedTiers(config.tiers)) {
    const tierMax = tier.maxQuantity;
    if (tierMax == null) {
      continue;
    }

    const tierLabel = tier.label ?? formatTierLabel(previousThreshold + 1, tierMax);
    const tierQuantity = Math.max(tierMax - previousThreshold, 0);
    const ordersInTier = Math.max(
      Math.min(totalOrders, tierMax) - previousThreshold,
      0,
    );

    lastThreshold = tierMax;

    if (ordersInTier <= 0) {
      previousThreshold = tierMax;
      continue;
    }

    if (tier.pricePerUnit != null) {
      const subtotal = ordersInTier * tier.pricePerUnit;
      breakdown.push({
        tierLabel,
        quantity: ordersInTier,
        unitPrice: tier.pricePerUnit,
        subtotal,
        type: "per_unit",
      });
      total += subtotal;
    } else if (tier.totalPrice != null) {
      if (totalOrders >= tierMax) {
        breakdown.push({
          tierLabel,
          quantity: tierQuantity,
          unitPrice: tierQuantity > 0 ? tier.totalPrice / tierQuantity : tier.totalPrice,
          subtotal: tier.totalPrice,
          type: "package",
        });
        total += tier.totalPrice;
      } else {
        const fallbackRate = config.fallbackRate ?? 0;
        const subtotal = ordersInTier * fallbackRate;
        breakdown.push({
          tierLabel: `Partial: ${tierLabel}`,
          quantity: ordersInTier,
          unitPrice: fallbackRate,
          subtotal,
          type: "fallback",
        });
        total += subtotal;
      }
    }

    previousThreshold = tierMax;
  }

  const overflowOrders = Math.max(totalOrders - lastThreshold, 0);
  if (overflowOrders > 0 && config.overflowRate) {
    const subtotal = overflowOrders * config.overflowRate;
    breakdown.push({
      tierLabel: "Extra deliveries",
      quantity: overflowOrders,
      unitPrice: config.overflowRate,
      subtotal,
      type: "overflow",
    });
    total += subtotal;
  }

  return { breakdown, total };
}

/**
 * Find the tier that contains the given quantity position.
 */
function getSortedTiers(tiers: PricingTier[]): PricingTier[] {
  return [...tiers]
    .filter((tier) => !tier.isCustom)
    .sort((a, b) => a.minQuantity - b.minQuantity);
}

function formatTierLabel(minQuantity: number, maxQuantity: number): string {
  return `${minQuantity}–${maxQuantity}`;
}

/**
 * Validate pricing tiers configuration.
 * Returns an array of error messages (empty if valid).
 */
export function validatePricingTiers(config: PricingConfig): string[] {
  const errors: string[] = [];

  if (!config.tiers || config.tiers.length === 0) {
    errors.push("At least one pricing tier is required.");
    return errors;
  }

  const sorted = [...config.tiers].sort(
    (a, b) => a.minQuantity - b.minQuantity,
  );

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];

    if (tier.minQuantity < 0) {
      errors.push(`Tier ${i + 1}: minQuantity must be >= 0.`);
    }

    if (tier.maxQuantity != null && tier.maxQuantity < tier.minQuantity) {
      errors.push(`Tier ${i + 1}: maxQuantity must be >= minQuantity.`);
    }

    if (
      !tier.isCustom &&
      tier.pricePerUnit == null &&
      tier.totalPrice == null
    ) {
      errors.push(
        `Tier ${i + 1}: must have either pricePerUnit or totalPrice.`,
      );
    }

    // Check for overlap with next tier
    if (i < sorted.length - 1) {
      const nextTier = sorted[i + 1];
      if (
        tier.maxQuantity != null &&
        nextTier.minQuantity <= tier.maxQuantity
      ) {
        errors.push(
          `Tiers ${i + 1} and ${i + 2} overlap: maxQuantity ${tier.maxQuantity} >= next minQuantity ${nextTier.minQuantity}.`,
        );
      }
    }
  }

  // Validate fallbackRate for plans with package-priced tiers
  const hasPackageTiers = sorted.some(
    (t) => !t.isCustom && t.totalPrice != null,
  );
  if (hasPackageTiers && (!config.fallbackRate || config.fallbackRate <= 0)) {
    errors.push(
      "fallbackRate is required for plans with package-priced tiers and must be a positive number.",
    );
  }

  return errors;
}
