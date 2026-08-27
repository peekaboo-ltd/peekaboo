import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faClock,
  faCoins,
  faLayerGroup,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
  PublicStatCard,
} from '@/components/layout/PublicPage';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchPublicBusinessPlanBySlugQuery } from '@/api/queries/businessPlan.queries';
import type { BusinessPlan, PricingTier } from '@/types/businessPlan.type';
import { BillingPeriod } from '@/types/businessPlan.type';

const fadeInUp = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 1, 1] as const },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 1, 1] as const },
  },
};

const formatCurrency = (value: number, currency = 'RWF') =>
  `${Number(value).toLocaleString()} ${currency}`;

const getBillingPeriodLabel = (billingPeriod: BillingPeriod) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return 'Daily';
    case BillingPeriod.WEEKLY:
      return 'Weekly';
    case BillingPeriod.MONTHLY:
    default:
      return 'Monthly';
  }
};

const getBillingPeriodSuffix = (billingPeriod: BillingPeriod) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return 'day';
    case BillingPeriod.WEEKLY:
      return 'week';
    case BillingPeriod.MONTHLY:
    default:
      return 'month';
  }
};

const getFirstDisplayTier = (tiers?: PricingTier[]) => {
  if (!tiers?.length) return undefined;

  return [...tiers]
    .filter((tier) => !tier.isCustom && (tier.totalPrice || tier.pricePerUnit))
    .sort((a, b) => {
      const aValue = a.totalPrice ?? a.pricePerUnit ?? Number.MAX_SAFE_INTEGER;
      const bValue = b.totalPrice ?? b.pricePerUnit ?? Number.MAX_SAFE_INTEGER;
      return aValue - bValue;
    })[0];
};

const getTierRangeLabel = (tier: PricingTier, billingPeriod: BillingPeriod) => {
  if (tier.label) return tier.label;

  if (tier.isCustom) return 'Custom range';

  const periodUnit = billingPeriod === BillingPeriod.DAILY
    ? 'day'
    : billingPeriod === BillingPeriod.WEEKLY
      ? 'week'
      : 'month';

  if (tier.maxQuantity == null) {
    return `${tier.minQuantity}+ deliveries per ${periodUnit}`;
  }

  return `${tier.minQuantity} – ${tier.maxQuantity} deliveries per ${periodUnit}`;
};

const getHeadlinePrice = (plan: BusinessPlan) => {
  if (plan.isCustomPricing) {
    return 'Custom monthly pricing';
  }

  const firstTier = getFirstDisplayTier(plan.pricingTiers?.tiers);
  if (firstTier?.totalPrice) {
    return `From ${formatCurrency(firstTier.totalPrice, plan.currency)} / ${getBillingPeriodSuffix(plan.billingPeriod)}`;
  }

  if (firstTier?.pricePerUnit) {
    return `From ${formatCurrency(firstTier.pricePerUnit, plan.currency)} / delivery`;
  }

  if (plan.pricePerOrder) {
    return `From ${formatCurrency(Number(plan.pricePerOrder), plan.currency)} / delivery`;
  }

  return 'Contact us for pricing';
};

const getPricingRows = (plan: BusinessPlan) => {
  if (!plan.pricingTiers?.tiers?.length) return [];

  return plan.pricingTiers.tiers.map((tier) => {
    const priceLabel = tier.isCustom
      ? 'Custom pricing'
      : tier.totalPrice
        ? formatCurrency(tier.totalPrice, plan.currency)
        : tier.pricePerUnit
          ? `${formatCurrency(tier.pricePerUnit, plan.currency)} / delivery`
          : 'Included in custom agreement';

    return {
      label: getTierRangeLabel(tier, plan.billingPeriod),
      priceLabel,
    };
  });
};

const PublicServiceDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isFetching, error } = useFetchPublicBusinessPlanBySlugQuery(slug || '', {
    skip: !slug,
  });
  const plan = data?.data;

  useDocumentTitle(plan ? `${plan.name} | Services` : 'Service Details');

  if (isFetching) {
    return (
      <PublicPage className="bg-(--surface)">
        <section className="grid gap-4">
          <div className="h-64 animate-pulse rounded-md border border-(--line) bg-(--paper)" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-md border border-(--line) bg-(--paper)"
              />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-96 animate-pulse rounded-md border border-(--line) bg-(--paper)" />
            <div className="h-96 animate-pulse rounded-md border border-(--line) bg-(--paper)" />
          </div>
        </section>
      </PublicPage>
    );
  }

  if (error || !plan) {
    return (
      <PublicPage className="bg-(--surface)">
        <PublicPageHero
          eyebrow="Service details"
          title="We couldn’t find that delivery plan"
          description="The plan may have moved, been archived, or the link may be incomplete."
          className="border-(--line) bg-(--paper)"
          actions={
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-(--radius-control) px-4 py-2 text-sm font-normal text-(--muted) transition-colors duration-200 hover:bg-(--surface)"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Back to services
            </Link>
          }
        />
        <PublicSectionCard
          eyebrow="Next step"
          title="Explore active services"
          description="Browse our current delivery plans or reach out directly for a tailored setup."
          className="rounded-md border-(--line)"
        >
          <div className="flex flex-wrap gap-3">
            <Button route="/services" className="w-fit" primary>
              Browse services
            </Button>
            <Button route="/contact" className="w-fit">
              Talk to our team
            </Button>
          </div>
        </PublicSectionCard>
      </PublicPage>
    );
  }

  const pricingRows = getPricingRows(plan);
  const headlinePrice = getHeadlinePrice(plan);
  const overflowRate = plan.pricingTiers?.overflowRate;
  const fallbackRate = plan.pricingTiers?.fallbackRate;
  const hasPackageTiers = plan.pricingTiers?.tiers?.some(
    (tier) => !tier.isCustom && tier.totalPrice,
  );
  const featureList =
    plan.features?.length
      ? plan.features
      : pricingRows.map((row) => `${row.label} → ${row.priceLabel}`);

  return (
    <PublicPage className="bg-(--surface)">
      <motion.section
        className="grid gap-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={fadeInUp}>
          <PublicPageHero
            eyebrow="Business service"
            title={
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span>{plan.name}</span>
                  {plan.badge ? (
                    <span className="inline-flex h-6 w-fit items-center gap-2 rounded-(--radius-pill) bg-(--ink) px-3 text-xs font-normal text-(--paper)">
                      <FontAwesomeIcon icon={faStar} className="text-xs" />
                      {plan.badge}
                    </span>
                  ) : null}
                  {plan.isDefault ? (
                    <span className="inline-flex h-6 w-fit items-center gap-2 rounded-(--radius-pill) border border-(--ink) px-3 text-xs font-normal text-(--ink)">
                      Preferred plan
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[1.05rem] font-normal text-(--muted) sm:text-[1.2rem]">
                    {headlinePrice}
                  </span>
                  <span className="max-w-3xl text-sm leading-6 text-(--muted)">
                    {plan.description || 'A flexible business delivery plan built around your operational rhythm and shipment volume.'}
                  </span>
                </div>
              </div>
            }
            description="Plan details, pricing rhythm, and included operational support at a glance."
            actions={
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-(--radius-control) bg-(--paper) px-4 py-2 text-sm font-normal text-(--muted) transition-colors duration-200 hover:bg-(--surface)"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                  Back to services
                </Link>
                <Button route="/contact" primary className="rounded-(--radius-control) px-6!">
                  Talk to our team
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Button>
              </div>
            }
          />
        </motion.div>

        <motion.section
          variants={fadeInUp}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <PublicStatCard
            label="Billing rhythm"
            value={getBillingPeriodLabel(plan.billingPeriod)}
            className="border-(--line)"
            icon={<FontAwesomeIcon icon={faClock} />}
          />
          <PublicStatCard
            label="Pricing mode"
            value={plan.isCustomPricing ? 'Custom agreement' : 'Structured tiers'}
            className="border-(--line)"
            icon={<FontAwesomeIcon icon={faLayerGroup} />}
          />
          <PublicStatCard
            label="Currency"
            value={plan.currency || 'RWF'}
            className="border-(--line)"
            icon={<FontAwesomeIcon icon={faCoins} />}
          />
          <PublicStatCard
            label="Positioning"
            value={plan.badge || (plan.isDefault ? 'Recommended' : 'Active plan')}
            className="border-(--line)"
            icon={<FontAwesomeIcon icon={faStar} />}
          />
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div variants={fadeInUp} className="grid gap-4">
            <PublicSectionCard
              eyebrow="Overview"
              title="What this plan is built for"
              description="Designed for teams that want transparent pricing and dependable delivery operations."
              className="border-(--line)"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-(--radius-control) bg-(--surface) p-5">
                  <p className="type-eyebrow">
                    Headline pricing
                  </p>
                  <p className="type-metric mt-3">
                    {headlinePrice}
                  </p>
                </article>
                <article className="rounded-(--radius-control) bg-(--surface) p-5">
                  <p className="type-eyebrow">
                    Ideal usage
                  </p>
                  <p className="mt-3 text-sm leading-6 text-(--muted)">
                    {plan.isCustomPricing
                      ? 'Best for businesses that need a dedicated operational setup and negotiated service design.'
                      : `Best for teams running ${getBillingPeriodLabel(plan.billingPeriod).toLowerCase()} delivery cycles and wanting predictable cost control.`}
                  </p>
                </article>
              </div>
            </PublicSectionCard>

            <PublicSectionCard
              eyebrow="Included"
              title="Features and benefits"
              description="Every plan includes the operational essentials listed below."
              className="border-(--line)"
            >
              <ul className="grid gap-3 md:grid-cols-2">
                {featureList.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 rounded-(--radius-control) border border-(--line) bg-(--paper) p-4"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-(--radius-control) bg-(--surface) text-(--muted)">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    </span>
                    <span className="text-sm leading-6 text-(--muted)">{feature}</span>
                  </li>
                ))}
              </ul>
            </PublicSectionCard>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid gap-4">
            <PublicSectionCard
              eyebrow="Pricing structure"
              title="Tier details"
              description="A breakdown of volume bands, fallback rates, and overflow charges."
              className="border-(--line)"
            >
              <div className="space-y-3">
                {pricingRows.length > 0 ? (
                  pricingRows.map((row) => (
                    <article
                      key={`${row.label}-${row.priceLabel}`}
                      className="rounded-(--radius-control) bg-(--surface) p-4"
                    >
                      <p className="text-sm font-normal text-(--ink)">{row.label}</p>
                      <p className="mt-1 text-sm text-(--muted)">{row.priceLabel}</p>
                    </article>
                  ))
                ) : (
                  <article className="rounded-(--radius-control) bg-(--surface) p-4">
                    <p className="text-sm text-(--muted)">
                      Pricing is tailored with our team based on your exact operational needs.
                    </p>
                  </article>
                )}

                {overflowRate ? (
                  <article className="rounded-(--radius-control) border border-(--line) p-4">
                    <p className="type-eyebrow">
                      Overflow rate
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      Additional deliveries are billed at {formatCurrency(overflowRate, plan.currency)} each.
                    </p>
                  </article>
                ) : null}

                {hasPackageTiers && fallbackRate ? (
                  <article className="rounded-(--radius-control) border p-4">
                    <p className="text-xs font-normal">
                      Fallback rate
                    </p>
                    <p className="mt-2 text-sm">
                      Partial package progress is billed at {formatCurrency(fallbackRate, plan.currency)} per delivery until the package threshold is met.
                    </p>
                  </article>
                ) : null}
              </div>
            </PublicSectionCard>

            <PublicSectionCard
              eyebrow="Next step"
              title="Talk through your rollout"
              description="We’ll help match this plan to your volumes, locations, and operating model."
              className="border-(--line)"
            >
              <div className="space-y-4">
                <p className="text-sm leading-6 text-(--muted)">
                  Tell us about your expected delivery volume and service area, and we’ll confirm the best plan setup for your team.
                </p>
                <div className="flex flex-col gap-3">
                  <Button route="/contact" primary className="w-full rounded-(--radius-control)">
                    Talk to our team
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Button>
                  <Button route="/services" className="w-full rounded-(--radius-control)">
                    Explore all services
                  </Button>
                </div>
              </div>
            </PublicSectionCard>
          </motion.div>
        </section>
      </motion.section>
    </PublicPage>
  );
};

export default PublicServiceDetailsPage;
