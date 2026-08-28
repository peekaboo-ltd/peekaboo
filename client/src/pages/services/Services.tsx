import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Layers } from 'lucide-react';
import BusinessPlansSection from '@/pages/home/components/BusinessPlansSection';
import SupportSection from '@/pages/home/components/SupportSection';
import FinalCtaSection from '@/pages/home/components/FinalCtaSection';
import HeroTrustIndicators from '@/pages/home/components/HeroTrustIndicators';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchPublicBusinessPlansQuery } from '@/api/queries/businessPlan.queries';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useHomeContent } from '@/pages/home/useHomeContent';
import { entranceVariants } from '@/pages/home/home.animations';
import { billingPeriodLabel } from './plan-pricing';
import ServicesVolumeVisual from './components/ServicesVolumeVisual';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const pricingPrinciples = [
  {
    icon: Layers,
    title: 'Volume bands',
    description:
      'Each plan covers a delivery range. Stay in your band and your per-drop rate stays predictable.',
  },
  {
    icon: BarChart3,
    title: 'No seat counts',
    description:
      'Price scales with how much you send, not how many people log in. Add teammates without adding cost.',
  },
  {
    icon: FileText,
    title: 'Clear invoicing',
    description:
      'Weekly statements with every drop itemised. Pay by MoMo, card, or wire on terms that fit your ops.',
  },
] as const;

const Services = () => {
  const navigate = useNavigate();
  useDocumentTitle('Services');

  const { data, isFetching } = useFetchPublicBusinessPlansQuery(undefined);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, supportContacts } = useHomeContent();
  const plans = data?.data || [];

  const cadences = Array.from(
    new Set(plans.map((plan) => billingPeriodLabel(plan.billingPeriod))),
  );

  const handleContactNavigation = () => {
    navigate('/contact');
  };

  const scrollToPlans = () => {
    document.getElementById('business-plans')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <main className="home-page relative min-h-screen w-full overflow-x-clip bg-(--paper)">
      <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-(--paper) text-(--ink)">
        <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
            <motion.div
              className="flex flex-col items-start gap-5"
              variants={entranceVariants}
              initial="hidden"
              animate="visible"
            >
              <hgroup className="space-y-3">
                <p className="type-eyebrow">Business pricing</p>
                <h1 className="type-display max-w-[16ch] text-(--ink)">
                  Pay for the volume you actually send
                </h1>
                <p className="type-body max-w-[52ch] text-(--muted)">
                  Every plan is priced in volume bands. Find the band you operate in,
                  and that is your cost — no seat counts, no minimum commitment.
                </p>
              </hgroup>

              {!isFetching && plans.length ? (
                <dl className="flex w-full max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
                  <div>
                    <dt className="type-eyebrow">Plans</dt>
                    <dd className="type-card-title mt-2">{plans.length}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow">Billing cadences</dt>
                    <dd className="type-card-title mt-2">{cadences.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow">Commitment</dt>
                    <dd className="type-card-title mt-2">None</dd>
                  </div>
                </dl>
              ) : null}

              <button
                type="button"
                onClick={scrollToPlans}
                className="link-arrow link-sweep inline-flex items-center gap-1.5 text-sm text-(--ink)"
              >
                Compare plans
                <FontAwesomeIcon icon={faChevronDown} className="size-4" aria-hidden="true" />
              </button>

              <HeroTrustIndicators
                landingStats={landingStats}
                activeCustomersLabel={heroCopy.activeCustomersLabel}
                completedOrdersLabel={heroCopy.completedOrdersLabel}
                fallbackLabel={heroCopy.growingCommunityLabel}
              />
            </motion.div>

            <div className="max-lg:hidden">
              <ServicesVolumeVisual
                planCount={plans.length || 3}
                cadenceLabel={cadences.length ? cadences.join(' · ') : 'Monthly · Weekly'}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-rhythm w-full border-(--line) bg-(--paper)">
        <div className="app-container">
          <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <hgroup>
              <p className="type-eyebrow">How pricing works</p>
              <h2 className="type-h2 mt-2">
                One band.
                <br />
                One clear rate.
              </h2>
            </hgroup>
            <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
              Peekaboo plans are built for teams that send regularly across Kigali —
              not for counting seats or guessing monthly minimums.
            </p>
          </header>

          <ol className="grid gap-6 md:grid-cols-3">
            {pricingPrinciples.map((principle) => {
              const Icon = principle.icon;
              return (
                <li key={principle.title} className="relative rounded-md border border-(--line) p-6">
                  <span className="flex size-10 items-center justify-center rounded-(--radius-control) border border-(--ink)">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="type-h3 mt-8">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-[1.55] text-(--muted)">
                    {principle.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <BusinessPlansSection
        title="Business delivery plans"
        subtitle="Choose the volume band that matches how your team sends across Kigali."
        showHeader
        popularLabel="Most popular"
        ctaLabel="See full pricing"
        plans={plans}
        isLoading={isFetching}
      />

      <SupportSection
        contacts={supportContacts}
        onContactClick={handleContactNavigation}
      />

      <FinalCtaSection
        title="Not sure which band you land in?"
        subtitle="Tell us roughly how much you send in a month and we will confirm the plan that costs you least."
        buttonLabel="Talk to our team"
        onScrollToForm={handleContactNavigation}
      />
    </main>
  );
};

export default Services;
