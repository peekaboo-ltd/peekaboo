import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchPublicBusinessPlanBySlugQuery } from '@/api/queries/businessPlan.queries';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import FinalCtaSection from '@/pages/home/components/FinalCtaSection';
import HeroTrustIndicators from '@/pages/home/components/HeroTrustIndicators';
import SupportSection from '@/pages/home/components/SupportSection';
import { useHomeContent } from '@/pages/home/useHomeContent';
import { entranceVariants } from '@/pages/home/home.animations';
import PlanVolumeCalculator from './PlanVolumeCalculator';
import { PriceLockup } from './PlanCard';
import ServicesVolumeVisual from './components/ServicesVolumeVisual';
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';
import {
  billingPeriodLabel,
  formatCurrency,
  getPricingRows,
  periodNoun,
  resolvePrice,
} from './plan-pricing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const PlanFact = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="type-eyebrow">{label}</dt>
    <dd className="type-card-title mt-1.5 break-words">{value}</dd>
  </div>
);

const ServiceDetailsShell = ({ children }: { children: React.ReactNode }) => (
  <main className="home-page relative min-h-screen w-full overflow-x-clip bg-(--paper)">
    {children}
  </main>
);

const ServiceDetailsLoading = () => (
  <ServiceDetailsShell>
    <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center">
      <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
          <div className="space-y-5">
            <div className="h-4 w-24 animate-pulse rounded bg-(--surface)" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-(--surface)" />
            <div className="h-20 w-full max-w-md animate-pulse rounded bg-(--surface)" />
            <div className="h-32 w-full max-w-md animate-pulse rounded bg-(--surface)" />
          </div>
          <div className="hidden aspect-[4/3] animate-pulse rounded-md bg-(--surface) lg:block" />
        </div>
      </div>
    </section>
  </ServiceDetailsShell>
);

const PublicServiceDetailsPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data, isFetching, error } = useFetchPublicBusinessPlanBySlugQuery(
    slug || '',
    { skip: !slug },
  );
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, supportContacts } = useHomeContent();
  const plan = data?.data;

  useDocumentTitle(plan ? `${plan.name} | Services` : 'Service Details');

  const handleContactNavigation = () => {
    navigate('/contact');
  };

  if (isFetching) {
    return <ServiceDetailsLoading />;
  }

  if (error || !plan) {
    return (
      <ServiceDetailsShell>
        <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-(--paper) text-(--ink)">
          <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
            <motion.div
              className="mx-auto flex max-w-xl flex-col items-start gap-5"
              variants={entranceVariants}
              initial="hidden"
              animate="visible"
            >
              <hgroup className="space-y-3">
                <p className="type-eyebrow">Service details</p>
                <h1 className="type-display max-w-[16ch] text-(--ink)">
                  We couldn&apos;t find that plan
                </h1>
                <p className="type-body max-w-[46ch] text-(--muted)">
                  The plan may have been archived, or the link may be incomplete.
                </p>
              </hgroup>
              <Button route="/services" primary>
                Browse all plans
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </motion.div>
          </div>
        </section>
      </ServiceDetailsShell>
    );
  }

  const price = resolvePrice(plan);
  const rows = getPricingRows(plan);
  const unit = periodNoun(plan.billingPeriod);
  const quotableRows = rows.filter((row) => !row.isCustom);
  const entryVolume = quotableRows[0]?.tier.minQuantity;
  const topBand = quotableRows[quotableRows.length - 1]?.tier;
  const featureList = plan.features ?? [];
  const cadenceLabel = billingPeriodLabel(plan.billingPeriod);

  return (
    <ServiceDetailsShell>
      <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-(--paper) text-(--ink)">
        <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
            <motion.div
              className="flex flex-col items-start gap-5"
              variants={entranceVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                to="/services"
                className="p-2 px-4 bg-(--surface) hover:bg-(--surface-hover) active:bg-(--surface-active) rounded-md inline-flex items-center gap-2 text-sm text-(--ink)"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="size-4" aria-hidden="true" />
                All plans
              </Link>

              <hgroup className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="type-eyebrow">{cadenceLabel} plan</p>
                  {plan.badge ? (
                    <span className="inline-flex h-5 items-center rounded-(--radius-pill) bg-(--ink) px-2.5 text-[0.6875rem] font-medium uppercase text-(--paper)">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <h1 className="type-display max-w-[16ch] text-(--ink)">{plan.name}</h1>
                <p className="type-body max-w-[52ch] text-(--muted)">
                  {plan.description ||
                    'A business delivery plan priced in volume bands, so your cost follows what you actually send.'}
                </p>
              </hgroup>

              <div className="w-full max-w-md border-t border-(--line) pt-6">
                <p className="type-eyebrow">Price</p>
                <PriceLockup price={price} className="mt-2" />
              </div>

              <dl className="flex w-full max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
                <PlanFact label="Billed" value={cadenceLabel} />
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
              </dl>

              <Link
                to="/services"
                className="link-arrow p-1.5 px-3 bg-(--surface) hover:bg-(--surface-hover) active:bg-(--surface-active) rounded-md inline-flex items-center gap-1.5 text-sm text-(--ink)"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="size-4" aria-hidden="true" />
                Compare plans
              </Link>

              <HeroTrustIndicators
                landingStats={landingStats}
                activeCustomersLabel={heroCopy.activeCustomersLabel}
                completedOrdersLabel={heroCopy.completedOrdersLabel}
                fallbackLabel={heroCopy.growingCommunityLabel}
              />
            </motion.div>

            <div className="max-lg:hidden">
              <ServicesVolumeVisual
                planCount={rows.length || 2}
                cadenceLabel={cadenceLabel}
              />
            </div>
          </div>
        </div>
      </section>

      {rows.length ? (
        <section className="section-rhythm w-full border-(--line) bg-(--paper)">
          <div className="app-container">
            <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <hgroup>
                <p className="type-eyebrow">Pricing</p>
                <h2 className="type-h2 mt-2">
                  Find your
                  <br />
                  volume band.
                </h2>
              </hgroup>
              <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
                Enter what you send in a typical {unit}. The band you land in is
                highlighted below.
              </p>
            </header>

            <div className="rounded-md border border-(--line) p-6">
              <PlanVolumeCalculator plan={plan} />
            </div>
          </div>
        </section>
      ) : null}

      {featureList.length ? (
        <section className="section-rhythm w-full border-(--line) bg-(--paper)">
          <div className="app-container">
            <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <hgroup>
                <p className="type-eyebrow">Included</p>
                <h2 className="type-h2 mt-2">
                  What every
                  <br />
                  band includes.
                </h2>
              </hgroup>
              <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
                Every volume band on {plan.name} ships with the same operational
                support and delivery tooling.
              </p>
            </header>

            <ul className="grid gap-3 sm:grid-cols-2">
              {featureList.map((feature, index) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-md border border-(--line) p-4"
                >
                  <PublicIconBadge
                    icon={Check}
                    tone={publicAccentAt(index)}
                    size="xs"
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-[1.55] text-(--ink) mt-2">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <SupportSection
        contacts={supportContacts}
        onContactClick={handleContactNavigation}
      />

      <FinalCtaSection
        title={`Ready to start on ${plan.name}?`}
        subtitle={`Tell us your volume and service area and we will confirm the setup${plan.pricingTiers?.overflowRate
          ? `, including how overflow past a band is billed at ${formatCurrency(plan.pricingTiers.overflowRate, plan.currency)} each`
          : ''
          }.`}
        buttonLabel="Talk to our team"
        onScrollToForm={handleContactNavigation}
      />
    </ServiceDetailsShell>
  );
};

export default PublicServiceDetailsPage;
