import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchPublicBusinessPlanBySlugQuery } from '@/api/queries/businessPlan.queries';
import PlanVolumeCalculator from './PlanVolumeCalculator';
import { PriceLockup } from './PlanCard';
import {
  billingPeriodLabel,
  formatCurrency,
  getPricingRows,
  periodNoun,
  resolvePrice,
} from './plan-pricing';

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

/** One plain fact about the plan. Facts only — no positioning, no filler. */
const PlanFact = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="type-eyebrow">{label}</dt>
    <dd className="type-card-title mt-1.5 break-words">{value}</dd>
  </div>
);

const PublicServiceDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isFetching, error } = useFetchPublicBusinessPlanBySlugQuery(
    slug || '',
    { skip: !slug },
  );
  const plan = data?.data;

  useDocumentTitle(plan ? `${plan.name} | Services` : 'Service Details');

  if (isFetching) {
    return (
      <PublicPage>
        <section className="grid gap-4">
          <div className="h-56 animate-pulse rounded-(--radius-card) bg-(--surface)" />
          <div className="h-80 animate-pulse rounded-(--radius-card) bg-(--surface)" />
        </section>
      </PublicPage>
    );
  }

  if (error || !plan) {
    return (
      <PublicPage>
        <PublicPageHero
          eyebrow="Service details"
          title="We couldn't find that plan"
          description="The plan may have been archived, or the link may be incomplete."
          actions={
            <Button route="/services" primary>
              Browse all plans
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Button>
          }
        />
      </PublicPage>
    );
  }

  const price = resolvePrice(plan);
  const rows = getPricingRows(plan);
  const unit = periodNoun(plan.billingPeriod);
  const quotableRows = rows.filter((row) => !row.isCustom);
  const entryVolume = quotableRows[0]?.tier.minQuantity;
  const topBand = quotableRows[quotableRows.length - 1]?.tier;
  const featureList = plan.features ?? [];

  return (
    <PublicPage>
      <motion.section
        className="grid gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={fadeInUp}>
          <Link
            to="/services"
            className="type-body-sm inline-flex items-center gap-2 text-(--muted) hover:text-(--ink) p-2 px-4 rounded-(--radius-control) hover:bg-(--surface-hover)"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            All plans
          </Link>

          <header className="mt-5 border-b border-(--line) pb-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="type-eyebrow">
                    {billingPeriodLabel(plan.billingPeriod)} plan
                  </p>
                  {plan.badge ? (
                    <span className="inline-flex h-5 items-center rounded-(--radius-pill) bg-(--ink) px-2.5 text-[0.6875rem] font-medium uppercase text-(--paper)">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <h1 className="type-display mt-3">{plan.name}</h1>
                <p className="type-body mt-4 max-w-[56ch] text-(--muted)">
                  {plan.description ||
                    'A business delivery plan priced in volume bands, so your cost follows what you actually send.'}
                </p>
              </div>

              {/* The price appears once, here. It used to be restated in the
                  hero, a stat card, and an overview panel. */}
              <div className="card-quiet shrink-0 p-5 lg:min-w-[15rem]">
                {/* The lockup says "from" itself; an eyebrow reading
                    "Starting at" above it said the same thing twice. */}
                <p className="type-eyebrow">Price</p>
                <PriceLockup price={price} className="mt-2" />
              </div>
            </div>
          </header>
        </motion.div>

        <motion.dl
          variants={fadeInUp}
          className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-(--line) pb-8 md:grid-cols-4"
        >
          <PlanFact
            label="Billed"
            value={billingPeriodLabel(plan.billingPeriod)}
          />
          <PlanFact
            label="Volume bands"
            value={rows.length ? String(rows.length) : 'Quoted'}
          />
          <PlanFact
            label="Starts from"
            value={
              entryVolume != null
                ? `${entryVolume} per ${unit}`
                : 'Any volume'
            }
          />
          <PlanFact
            label="Upper limit"
            value={
              plan.isCustomPricing
                ? 'Negotiated'
                : topBand?.maxQuantity == null
                  ? 'None'
                  : `${topBand.maxQuantity} per ${unit}`
            }
          />
        </motion.dl>

        {rows.length ? (
          <motion.div variants={fadeInUp}>
            <PublicSectionCard
              eyebrow="Pricing"
              title="Find your band"
              description={`Enter what you send in a typical ${unit}. The band you land in is highlighted below.`}
            >
              <PlanVolumeCalculator plan={plan} />
            </PublicSectionCard>
          </motion.div>
        ) : null}

        {featureList.length ? (
          <motion.div variants={fadeInUp}>
            <PublicSectionCard eyebrow="Included" title="What every band includes">
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {featureList.map((feature) => (
                  <li key={feature} className="type-body-sm flex items-start gap-3">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="mt-1 shrink-0 text-xs text-(--ink)"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </PublicSectionCard>
          </motion.div>
        ) : null}

        {/* One ask, at the end. */}
        <motion.section
          variants={fadeInUp}
          className="card-framed flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <h2 className="type-card-title">Ready to start on {plan.name}?</h2>
            <p className="type-meta mt-1.5 max-w-[52ch]">
              Tell us your volume and service area and we will confirm the setup
              {plan.pricingTiers?.overflowRate
                ? `, including how overflow past a band is billed at ${formatCurrency(plan.pricingTiers.overflowRate, plan.currency)} each`
                : ''}
              .
            </p>
          </div>
          <Button route="/contact" primary className="shrink-0">
            Talk to our team
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Button>
        </motion.section>
      </motion.section>
    </PublicPage>
  );
};

export default PublicServiceDetailsPage;
