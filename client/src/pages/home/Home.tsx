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
    <main className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Home;
