import BusinessPlansSection from '@/pages/home/components/BusinessPlansSection';
import type { BusinessPlan } from '@/pages/home/home.types';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const businessPlans: BusinessPlan[] = [
  {
    name: 'Business Growth Plan',
    description: 'Scale your monthly deliveries with volume-based pricing that rewards growth.',
    price: 'From 1,200–1,500 RWF / delivery',
    features: [
      '0 – 150 deliveries per month → 1,500 RWF per delivery',
      '151 – 300 deliveries per month → 1,350 RWF per delivery',
      '301 – 500 deliveries per month → 1,200 RWF per delivery',
      '500+ deliveries → Custom volume agreement or dedicated rider solution',
    ],
  },
  {
    name: 'Weekly Boost Plan',
    description: 'Perfect for campaigns, launches, and short-term spikes in demand.',
    price: 'From 48,000 RWF / week',
    features: [
      '30 deliveries per week → 48,000 RWF',
      '50 deliveries per week → 75,000 RWF',
      '80 deliveries per week → 120,000 RWF',
      'Extra deliveries → 1,500 RWF each',
    ],
    isPopular: true,
  },
  {
    name: 'Daily Power Pack',
    description: 'Ideal for flash sales, peak days, and busy periods.',
    price: 'From 8,500 RWF / day',
    features: [
      '5 deliveries per day → 8,500 RWF',
      '10 deliveries per day → 16,000 RWF',
      '20 deliveries per day → 30,000 RWF',
      'Extra deliveries → 1,600 RWF each',
    ],
  },
  {
    name: 'Dedicated Rider Solution',
    description: 'Your own full-time rider dedicated to your business operations.',
    price: 'Custom monthly pricing',
    features: [
      'Full-time rider (8 hours / day)',
      'Priority dispatching for your orders',
      'Tailored operational structure for your workflows',
      'Deliveries within an agreed service zone',
      'Minimum commitment applies based on your requirements',
    ],
  },
];

const Services = () => {
  useDocumentTitle('Services');

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden pt-24 pb-14 bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.28),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.22),transparent_34%)]" />
        <article className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Business Delivery Plans</h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Choose the package that matches your growth: monthly, weekly, daily, or a dedicated rider
            fully committed to your operations.
          </p>
        </article>
      </section>

      <BusinessPlansSection
        badgeLabel="Business packages"
        title="Business Growth Plans"
        subtitle="Scale your deliveries with flexible monthly, weekly, and daily bundles—or unlock a dedicated rider for high and consistent demand."
        popularLabel="Most popular"
        perMonthLabel="Transparent, predictable pricing for growing teams"
        ctaLabel="Talk to our team"
        plans={businessPlans}
      />
    </main>
  );
};

export default Services;

