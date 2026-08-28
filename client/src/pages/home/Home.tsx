import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useFetchPublicBusinessPlansQuery } from '@/api/queries/businessPlan.queries';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useI18n } from '@/i18n/i18n';
import { useHomeContent } from './useHomeContent';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ServicesSection from './components/ServicesSection';
import HowItWorksSection from './components/HowItWorksSection';
import WhyPeekabooSection from './components/WhyPeekabooSection';
import BusinessSolutionsSection from './components/BusinessSolutionsSection';
import BusinessPlansSection from './components/BusinessPlansSection';
import SupportSection from './components/SupportSection';
import FinalCtaSection from './components/FinalCtaSection';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { data: businessPlansData, isFetching: isLoadingPlans } =
    useFetchPublicBusinessPlansQuery(undefined);
  const {
    heroCopy,
    quickActions,
    howItWorks,
    whyItems,
    businessFeatures,
    supportContacts,
  } = useHomeContent();

  useDocumentTitle('Home');

  const businessPlans = businessPlansData?.data || [];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToPlans = () => {
    document.getElementById('business-plans')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleContactNavigation = () => {
    navigate('/contact');
  };

  const handleTrackNavigation = () => {
    navigate('/track');
  };

  const handleRiderNavigation = () => {
    navigate('/contact');
  };

  const quickActionHandlers = [
    scrollToForm,
    handleTrackNavigation,
    handleContactNavigation,
    handleRiderNavigation,
  ];

  return (
    <main className="home-page relative min-h-screen w-full overflow-x-clip bg-(--paper)">
      <HeroSection
        formRef={formRef}
        onScrollToForm={scrollToForm}
        landingStats={landingStats}
        heroCopy={heroCopy}
        onContactClick={handleContactNavigation}
        onTrackClick={handleTrackNavigation}
      />

      <FeaturesSection
        actions={quickActions.map((action, index) => ({
          ...action,
          accent: index === 0,
          onClick: quickActionHandlers[index],
        }))}
      />

      <ServicesSection />

      <HowItWorksSection steps={howItWorks} onScrollToForm={scrollToForm} />

      <WhyPeekabooSection
        items={whyItems}
        landingStats={landingStats}
        activeCustomersLabel={t('home.stats.activeCustomers')}
        completedOrdersLabel={t('home.stats.customersWithOrders')}
      />

      <BusinessSolutionsSection
        features={businessFeatures}
        onContactClick={handleContactNavigation}
        onSeePlans={scrollToPlans}
      />

      <BusinessPlansSection
        badgeLabel={t('home.b2b.pricing.badge')}
        title={t('home.b2b.pricing.title')}
        subtitle={t('home.b2b.pricing.subtitle')}
        popularLabel="Most popular"
        ctaLabel="See full pricing"
        plans={businessPlans}
        isLoading={isLoadingPlans}
      />

      <SupportSection
        contacts={supportContacts}
        onContactClick={handleContactNavigation}
      />

      <FinalCtaSection
        title={t('home.cta.title')}
        subtitle={t('home.cta.subtitle')}
        buttonLabel={t('home.cta.button')}
        onScrollToForm={scrollToForm}
      />
    </main>
  );
};

export default Home;
