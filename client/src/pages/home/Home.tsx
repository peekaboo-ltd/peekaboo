import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from './components';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
