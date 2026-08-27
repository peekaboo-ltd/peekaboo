import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BusinessPlansSection from '@/pages/home/components/BusinessPlansSection';
import { mapApiPlanToCard } from '@/pages/home/home.utils';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { Button } from '@/components/ui/button';
import { useFetchPublicBusinessPlansQuery } from '@/api/queries/businessPlan.queries';

const Services = () => {
  useDocumentTitle('Services');
  const { data, isFetching } = useFetchPublicBusinessPlansQuery(undefined);
  const businessPlans = (data?.data || []).map(mapApiPlanToCard);

  return (
    <main className="min-h-screen bg-(--paper) text-(--ink)">
      <section className="section-rhythm border-b border-(--line)">
        <div className="app-container">
          <p className="text-xs font-medium text-(--muted)">Pricing</p>
          <h1 className="mt-4 max-w-[16ch] text-[clamp(2.5rem,1.6rem+3.6vw,3.75rem)] font-medium leading-[1.06]">
            Business delivery plans
          </h1>
          <p className="mt-4 max-w-[46ch] text-base leading-[1.6] text-(--muted)">
            Choose the package that matches your growth: monthly, weekly, daily, or a dedicated rider fully committed to your operations.
          </p>
        </div>
      </section>

      <BusinessPlansSection
        badgeLabel="Business packages"
        title="Business Growth Plans"
        subtitle="Scale your deliveries with flexible monthly, weekly, and daily bundles—or unlock a dedicated rider for high and consistent demand."
        popularLabel="Most popular"
        perMonthLabel="Transparent, predictable pricing for growing teams"
        ctaLabel="Talk to our team"
        detailsCtaLabel="View more details"
        plans={businessPlans}
        isLoading={isFetching}
      />

      <section className="invert-surface section-rhythm border-t border-(--line)">
        <div className="app-container text-center">
          <p className="text-xs font-medium text-(--muted)">Get started</p>
          <h2 className="mx-auto mt-3 max-w-[22ch] text-[clamp(1.75rem,1.3rem+1.8vw,2.25rem)] font-medium leading-[1.15]">
            Ready to streamline your deliveries?
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-base leading-[1.6] text-(--muted)">
            Get in touch with our team to find the plan that fits your operating rhythm.
          </p>
          <Button asChild size="lg" className="link-arrow mt-8">
            <Link to="/contact">
              Contact our team
              <ArrowRight data-slot="icon" className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Services;
