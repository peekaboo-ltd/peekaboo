import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { BusinessPlan } from '../entities/businessPlan.entity';
import {
  BusinessPlanStatus,
  PricingConfig,
} from '../constants/businessPlan.constants';
import { BillingPeriod } from '../constants/organization.constants';
import logger from '../helpers/logger.helper';

interface BusinessPlanSeed {
  name: string;
  slug: string;
  description: string;
  billingPeriod: BillingPeriod;
  pricePerOrder?: number;
  currency: string;
  features: string[];
  pricingTiers: PricingConfig;
  badge?: string;
  isCustomPricing: boolean;
  isDefault: boolean;
  status: BusinessPlanStatus;
}

const businessPlans: BusinessPlanSeed[] = [
  {
    name: 'Business Growth Plan',
    slug: 'business-growth-plan',
    description:
      'Scale your monthly deliveries with volume-based pricing that rewards growth.',
    billingPeriod: BillingPeriod.MONTHLY,
    pricePerOrder: 1500,
    currency: 'RWF',
    features: [
      'Transparent, predictable pricing for growing teams',
      '0 – 150 deliveries per month → 1,500 RWF per delivery',
      '151 – 300 deliveries per month → 1,350 RWF per delivery',
      '301 – 500 deliveries per month → 1,200 RWF per delivery',
      '500+ deliveries → Custom volume agreement or dedicated rider solution',
    ],
    pricingTiers: {
      tiers: [
        {
          minQuantity: 0,
          maxQuantity: 150,
          pricePerUnit: 1500,
          label: '0 – 150 deliveries per month',
        },
        {
          minQuantity: 151,
          maxQuantity: 300,
          pricePerUnit: 1350,
          label: '151 – 300 deliveries per month',
        },
        {
          minQuantity: 301,
          maxQuantity: 500,
          pricePerUnit: 1200,
          label: '301 – 500 deliveries per month',
        },
        {
          minQuantity: 501,
          maxQuantity: null,
          label: '500+ deliveries',
          isCustom: true,
        },
      ],
    },
    isCustomPricing: false,
    isDefault: true,
    status: BusinessPlanStatus.ACTIVE,
  },
  {
    name: 'Weekly Boost Plan',
    slug: 'weekly-boost-plan',
    description:
      'Perfect for campaigns, launches, and short-term spikes in demand.',
    billingPeriod: BillingPeriod.WEEKLY,
    currency: 'RWF',
    features: [
      'Transparent, predictable pricing for growing teams',
      '30 deliveries per week → 48,000 RWF',
      '50 deliveries per week → 75,000 RWF',
      '80 deliveries per week → 120,000 RWF',
      'Extra deliveries → 1,500 RWF each',
    ],
    pricingTiers: {
      tiers: [
        {
          minQuantity: 0,
          maxQuantity: 30,
          totalPrice: 48000,
          label: '30 deliveries per week',
        },
        {
          minQuantity: 31,
          maxQuantity: 50,
          totalPrice: 75000,
          label: '50 deliveries per week',
        },
        {
          minQuantity: 51,
          maxQuantity: 80,
          totalPrice: 120000,
          label: '80 deliveries per week',
        },
      ],
      overflowRate: 1500,
    },
    badge: 'MOST POPULAR',
    isCustomPricing: false,
    isDefault: false,
    status: BusinessPlanStatus.ACTIVE,
  },
  {
    name: 'Daily Power Pack',
    slug: 'daily-power-pack',
    description: 'Ideal for flash sales, peak days, and busy periods.',
    billingPeriod: BillingPeriod.DAILY,
    pricePerOrder: 1600,
    currency: 'RWF',
    features: [
      'Transparent, predictable pricing for growing teams',
      '5 deliveries per day → 8,500 RWF',
      '10 deliveries per day → 16,000 RWF',
      '20 deliveries per day → 30,000 RWF',
      'Extra deliveries → 1,600 RWF each',
    ],
    pricingTiers: {
      tiers: [
        {
          minQuantity: 0,
          maxQuantity: 5,
          totalPrice: 8500,
          label: '5 deliveries per day',
        },
        {
          minQuantity: 6,
          maxQuantity: 10,
          totalPrice: 16000,
          label: '10 deliveries per day',
        },
        {
          minQuantity: 11,
          maxQuantity: 20,
          totalPrice: 30000,
          label: '20 deliveries per day',
        },
      ],
      overflowRate: 1600,
    },
    isCustomPricing: false,
    isDefault: false,
    status: BusinessPlanStatus.ACTIVE,
  },
  {
    name: 'Dedicated Rider Solution',
    slug: 'dedicated-rider-solution',
    description:
      'Your own full-time rider dedicated to your business operations.',
    billingPeriod: BillingPeriod.MONTHLY,
    currency: 'RWF',
    features: [
      'Transparent, predictable pricing for growing teams',
      'Full-time rider (8 hours / day)',
      'Priority dispatching for your orders',
      'Tailored operational structure for your workflows',
      'Deliveries within an agreed service zone',
      'Minimum commitment applies based on your requirements',
    ],
    pricingTiers: {
      tiers: [
        {
          minQuantity: 1,
          maxQuantity: null,
          label: 'Custom monthly pricing',
          isCustom: true,
        },
      ],
    },
    isCustomPricing: true,
    isDefault: false,
    status: BusinessPlanStatus.ACTIVE,
  },
];

async function main() {
  await AppDataSource.initialize();

  const planRepo = AppDataSource.getRepository(BusinessPlan);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const planData of businessPlans) {
    const existing = await planRepo.findOne({
      where: { name: planData.name },
    });

    if (existing) {
      const needsUpdate =
        existing.slug !== planData.slug ||
        existing.description !== planData.description ||
        existing.billingPeriod !== planData.billingPeriod ||
        existing.pricePerOrder !== planData.pricePerOrder ||
        existing.currency !== planData.currency ||
        JSON.stringify(existing.features || []) !== JSON.stringify(planData.features) ||
        JSON.stringify(existing.pricingTiers || null) !== JSON.stringify(planData.pricingTiers) ||
        existing.badge !== planData.badge ||
        existing.isCustomPricing !== planData.isCustomPricing ||
        existing.isDefault !== planData.isDefault ||
        existing.status !== planData.status;

      if (needsUpdate) {
        await planRepo.save({
          ...existing,
          ...planData,
        });
        logger.success(
          `[seed:business-plans] Updated plan "${planData.name}" with slug "${planData.slug}".`,
        );
        updated++;
        continue;
      }

      logger.info(
        `[seed:business-plans] Plan "${planData.name}" already exists — skipping.`,
      );
      skipped++;
      continue;
    }

    await planRepo.save(planRepo.create(planData));
    logger.success(
      `[seed:business-plans] Created plan "${planData.name}".`,
    );
    created++;
  }

  logger.success(
    `[seed:business-plans] Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}.`,
  );

  await AppDataSource.destroy();
}

main().catch(async (err) => {
  logger.error('[seed:business-plans] Failed:', err);
  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } catch {
    logger.error('[seed:business-plans] Failed to destroy database:', err);
  }
  process.exit(1);
});
