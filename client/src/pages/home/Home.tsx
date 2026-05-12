import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useHomeContent } from './useHomeContent';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ServicesSection from './components/ServicesSection';
import HowItWorksSection from './components/HowItWorksSection';
import WhyPeekabooSection from './components/WhyPeekabooSection';
import BusinessSolutionsSection from './components/BusinessSolutionsSection';

const Home = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, quickActions, howItWorks, whyItems, businessFeatures } =
    useHomeContent();

  useDocumentTitle('Home');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleContactNavigation = () => {
    navigate('/contact');
  };

  const handleTrackNavigation = () => {
    navigate('/track');
  };

  const quickActionHandlers = [
    scrollToForm,
    handleTrackNavigation,
    handleContactNavigation,
    handleContactNavigation,
  ];

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f6f1]">
      <HeroSection
        formRef={formRef}
        onScrollToForm={scrollToForm}
        landingStats={landingStats}
        heroCopy={heroCopy}
        onContactClick={handleContactNavigation}
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

      <WhyPeekabooSection items={whyItems} />

      <BusinessSolutionsSection
        features={businessFeatures}
        onContactClick={handleContactNavigation}
      />
    </main>
  );
};

export default Home;
