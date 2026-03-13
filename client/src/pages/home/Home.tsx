import { useRef } from 'react';
import {
  faBicycle,
  faBuilding,
  faChartLine,
  faHandshake,
  faRocket,
  faCheck,
  faShieldHalved,
  faClock,
  faMapLocationDot,
  faBoxesStacked,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import type {
  BusinessFeatureItem,
  FeatureItem,
  HeroCopy,
  HowItWorksStep,
} from './home.types';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BusinessSolutionsSection from './components/BusinessSolutionsSection';
import HowItWorksSection from './components/HowItWorksSection';
import FinalCtaSection from './components/FinalCtaSection';

const Home = () => {
  const { data: landingStats } = useGetLandingStatsQuery();
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  useDocumentTitle('Home');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const handleContactNavigation = () => {
    navigate('/contact');
  };

  const heroCopy: HeroCopy = {
    personalTabLabel: t('home.hero.tab.personal'),
    businessTabLabel: t('home.hero.tab.business'),
    personalTitle1: t('home.hero.title1'),
    personalTitle2: t('home.hero.title2'),
    personalSubtitle: t('home.hero.subtitle'),
    businessTitle1: t('home.b2b.title1'),
    businessTitle2: t('home.b2b.title2'),
    businessSubtitle: t('home.b2b.subtitle'),
    tryQuickDeliveryLabel: t('home.hero.tryQuickDelivery'),
    quickStartLabel: t('home.hero.quickStart'),
    formTitle: t('home.form.title'),
    formSubtitle: t('home.form.subtitle'),
    senderLabel: t('home.form.senderLabel'),
    senderPlaceholder: t('home.form.senderPlaceholder'),
    recipientLabel: t('home.form.recipientLabel'),
    recipientPlaceholder: t('home.form.recipientPlaceholder'),
    continueLabel: t('home.form.continue'),
    haveOrderLabel: t('home.hero.haveOrder'),
    trackHereLabel: t('home.hero.trackHere'),
    verifiedRidersLabel: t('home.hero.verifiedRiders'),
    realtimeTrackingLabel: t('home.hero.realtimeTracking'),
    customersLabel: 'customers',
    trustDailyLabel: 'Trusted daily',
    growingCommunityLabel: 'Growing in Kigali',
    businessAccountCta: t('home.b2b.cta.contact'),
  };

  const features: FeatureItem[] = [
    {
      icon: faBicycle,
      title: t('home.features.fastDelivery.title'),
      description: t('home.features.fastDelivery.desc'),
    },
    {
      icon: faShieldHalved,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.desc'),
    },
    {
      icon: faClock,
      title: t('home.features.tracking.title'),
      description: t('home.features.tracking.desc'),
    },
    {
      icon: faMapLocationDot,
      title: t('home.features.coverage.title'),
      description: t('home.features.coverage.desc'),
    },
  ];

  const businessFeatures: BusinessFeatureItem[] = [
    {
      icon: faChartLine,
      title: t('home.b2b.analytics.title'),
      description: t('home.b2b.analytics.desc'),
    },
    {
      icon: faBoxesStacked,
      title: t('home.b2b.bulk.title'),
      description: t('home.b2b.bulk.desc'),
    },
    {
      icon: faHandshake,
      title: t('home.b2b.support.title'),
      description: t('home.b2b.support.desc'),
    },
    {
      icon: faBuilding,
      title: t('home.b2b.plans.title'),
      description: t('home.b2b.plans.desc'),
    },
  ];

  const howItWorks: HowItWorksStep[] = [
    {
      step: '01',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.desc'),
      icon: faRocket,
    },
    {
      step: '02',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.desc'),
      icon: faBicycle,
    },
    {
      step: '03',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.desc'),
      icon: faCheck,
    },
  ];

  return (
    <main className="relative min-h-screen w-full bg-slate-50 overflow-x-hidden mt-0 max-lg:mt-14">
      <HeroSection
        formRef={formRef}
        onScrollToForm={scrollToForm}
        landingStats={landingStats}
        heroCopy={heroCopy}
        onContactClick={handleContactNavigation}
      />

      <FeaturesSection
        badgeLabel="Client friendly"
        title={t('home.features.title')}
        subtitle={t('home.features.subtitle')}
        features={features}
      />

      <BusinessSolutionsSection
        badgeLabel={t('home.b2b.badge')}
        title1={t('home.b2b.title1')}
        title2={t('home.b2b.title2')}
        subtitle={t('home.b2b.subtitle')}
        features={businessFeatures}
        primaryCtaLabel={t('home.b2b.cta.contact')}
        onContactClick={handleContactNavigation}
      />

      <HowItWorksSection
        badgeLabel="Simple steps"
        title={t('home.howItWorks.title')}
        subtitle={t('home.howItWorks.subtitle')}
        steps={howItWorks}
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
