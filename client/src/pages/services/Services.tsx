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
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

const Services = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  useDocumentTitle(t('services.docTitle'));

  const { data, isFetching } = useFetchPublicBusinessPlansQuery(undefined);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, supportContacts } = useHomeContent();
  const plans = data?.data || [];

  const cadences = Array.from(
    new Set(plans.map((plan) => billingPeriodLabel(plan.billingPeriod, t))),
  );
  const pricingPrinciples = [
    { icon: Layers, title: t('services.principle.volume.title'), description: t('services.principle.volume.description') },
    { icon: BarChart3, title: t('services.principle.seats.title'), description: t('services.principle.seats.description') },
    { icon: FileText, title: t('services.principle.invoicing.title'), description: t('services.principle.invoicing.description') },
  ];

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
                <p className="type-eyebrow">{t('services.pricingEyebrow')}</p>
                <h1 className="type-display max-w-[16ch] text-(--ink)">
                  {t('services.heroTitle')}
                </h1>
                <p className="type-body max-w-[52ch] text-(--muted)">
                  {t('services.heroDescription')}
                </p>
              </hgroup>

              {!isFetching && plans.length ? (
                <dl className="flex w-full max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
                  <div>
                    <dt className="type-eyebrow">{t('services.plans')}</dt>
                    <dd className="type-card-title mt-2">{plans.length}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow">{t('services.billingCadences')}</dt>
                    <dd className="type-card-title mt-2">{cadences.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow">{t('services.commitment')}</dt>
                    <dd className="type-card-title mt-2">{t('services.none')}</dd>
                  </div>
                </dl>
              ) : null}

              <button
                type="button"
                onClick={scrollToPlans}
                className="link-arrow link-sweep inline-flex items-center gap-1.5 text-sm text-(--ink)"
              >
                {t('services.comparePlans')}
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
                cadenceLabel={cadences.length ? cadences.join(' · ') : t('services.defaultCadence')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-rhythm w-full border-(--line) bg-(--paper)">
        <div className="app-container">
          <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <hgroup>
              <p className="type-eyebrow">{t('services.howEyebrow')}</p>
              <h2 className="type-h2 mt-2">
                {t('services.howTitle1')}
                <br />
                {t('services.howTitle2')}
              </h2>
            </hgroup>
            <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
              {t('services.howDescription')}
            </p>
          </header>

          <ol className="grid gap-6 md:grid-cols-3">
            {pricingPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <li key={principle.title} className="relative rounded-md border border-(--line) p-6">
                  <PublicIconBadge icon={Icon} tone={publicAccentAt(index)} size="md" />
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
        title={t('services.plansTitle')}
        subtitle={t('services.plansSubtitle')}
        showHeader
        popularLabel={t('plans.mostPopular')}
        ctaLabel={t('plans.seePricing')}
        plans={plans}
        isLoading={isFetching}
      />

      <SupportSection
        contacts={supportContacts}
        onContactClick={handleContactNavigation}
      />

      <FinalCtaSection
        title={t('services.ctaTitle')}
        subtitle={t('services.ctaSubtitle')}
        buttonLabel={t('services.talkToTeam')}
        onScrollToForm={handleContactNavigation}
      />
    </main>
  );
};

export default Services;
