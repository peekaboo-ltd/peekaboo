import { useRef } from 'react';
import {
  faBicycle,
  faBuilding,
  faChartLine,
  faHandshake,
  faRocket,
  faBoxesStacked,
  faCheck,
  faShieldHalved,
  faClock,
  faMapLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import type {
  BusinessFeatureItem,
  BusinessHighlightStat,
  FeatureItem,
  HeroBusinessStat,
  HeroCopy,
  HowItWorksStep,
  Testimonial,
} from './home.types';
import HeroSection from './components/HeroSection';
import TrustedBySection from './components/TrustedBySection';
import FeaturesSection from './components/FeaturesSection';
import BusinessSolutionsSection from './components/BusinessSolutionsSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialsSection from './components/TestimonialsSection';
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

  const heroBusinessStats: HeroBusinessStat[] = [
    { value: '98%', label: 'On-time' },
    { value: '500+', label: 'Daily runs' },
    { value: '24/7', label: 'Support' },
  ];

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

  const testimonials: Testimonial[] = [
    {
      name: t('home.testimonials.t1.name'),
      role: t('home.testimonials.t1.role'),
      content: t('home.testimonials.t1.content'),
      type: 'business',
    },
    {
      name: t('home.testimonials.t2.name'),
      role: t('home.testimonials.t2.role'),
      content: t('home.testimonials.t2.content'),
      type: 'business',
    },
    {
      name: t('home.testimonials.t3.name'),
      role: t('home.testimonials.t3.role'),
      content: t('home.testimonials.t3.content'),
      type: 'personal',
    },
  ];

  const trustedByIndustries = [
    'E-commerce',
    'Restaurants',
    'Pharmacies',
    'Retail',
    'Florists',
  ];

  const businessHighlights: BusinessHighlightStat[] = [
    { value: '10K+', label: t('home.b2b.stats.packages'), icon: faBoxesStacked },
    { value: '50+', label: t('home.b2b.stats.partners'), icon: faBuilding },
    { value: '99.2%', label: t('home.b2b.stats.success'), icon: faCheck },
    { value: '4.9/5', label: t('home.b2b.stats.rating'), icon: faHandshake },
  ];

  return (
    <main className="relative min-h-screen w-full bg-slate-50 overflow-x-hidden max-lg:mt-16">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.2),_transparent_70%)]"
        aria-hidden="true"
      />
      <HeroSection
        formRef={formRef}
        onScrollToForm={scrollToForm}
        landingStats={landingStats}
        heroCopy={heroCopy}
        businessStats={heroBusinessStats}
        onContactClick={handleContactNavigation}
      />

      <TrustedBySection label={t('home.b2b.trustedBy')} industries={trustedByIndustries} />

      <FeaturesSection
        badgeLabel="Why it works"
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
        stats={businessHighlights}
        onContactClick={handleContactNavigation}
      />

      <HowItWorksSection
        badgeLabel="Simple steps"
        title={t('home.howItWorks.title')}
        subtitle={t('home.howItWorks.subtitle')}
        steps={howItWorks}
      />

      <TestimonialsSection
        badgeLabel="Testimonials"
        title={t('home.testimonials.title')}
        subtitle={t('home.testimonials.subtitle')}
        testimonials={testimonials}
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
