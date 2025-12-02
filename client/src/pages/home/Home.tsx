import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from './components';

export const Home = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar user={user} />
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
