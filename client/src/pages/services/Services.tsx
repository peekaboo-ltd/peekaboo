import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BusinessPlansSection from '@/pages/home/components/BusinessPlansSection';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { Button } from '@/components/ui/button';
import { useFetchPublicBusinessPlansQuery } from '@/api/queries/businessPlan.queries';
import { billingPeriodLabel } from './plan-pricing';

const Services = () => {
  useDocumentTitle('Services');
  const { data, isFetching } = useFetchPublicBusinessPlansQuery(undefined);
  const plans = data?.data || [];

  // The page's own summary of the range on offer, drawn from the plans
  // themselves rather than asserted in copy that goes stale.
  const cadences = Array.from(
    new Set(plans.map((plan) => billingPeriodLabel(plan.billingPeriod))),
  );

  return (
    <main className="min-h-screen bg-(--paper) text-(--ink)">
      <section className="section-rhythm">
        <div className="app-container">
          <p className="type-eyebrow">Pricing</p>
          <h1 className="type-display mt-3 max-w-[16ch]">
            Pay for the volume you actually send
          </h1>
          <p className="type-body mt-4 max-w-[52ch] text-(--muted)">
            Every plan is priced in volume bands. Find the band you operate in,
            and that is your cost — no seat counts, no minimum commitment.
          </p>

          {!isFetching && plans.length ? (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
              <div>
                <dt className="type-eyebrow">Plans</dt>
                <dd className="type-card-title mt-2">{plans.length}</dd>
              </div>
              <div>
                <dt className="type-eyebrow">Billing cadences</dt>
                <dd className="type-card-title mt-2">{cadences.join(' · ')}</dd>
              </div>
              <div>
                <dt className="type-eyebrow">Commitment</dt>
                <dd className="type-card-title mt-2">None</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      {/* The hero above already introduces the range, so the row of cards
          carries no second header repeating it. */}
      <BusinessPlansSection
        title="Business delivery plans"
        subtitle=""
        showHeader={false}
        popularLabel="Most popular"
        ctaLabel="See full pricing"
        plans={plans}
        isLoading={isFetching}
      />

      <section className="invert-surface section-rhythm">
        <div className="app-container text-center">
          <p className="type-eyebrow">Get started</p>
          <h2 className="type-h2 mx-auto mt-2 max-w-[22ch]">
            Not sure which band you land in?
          </h2>
          <p className="type-body mx-auto mt-4 max-w-[46ch] text-(--muted)">
            Tell us roughly how much you send in a month and we will confirm the
            plan that costs you least.
          </p>
          <Button asChild size="lg" className="link-arrow mt-8">
            <Link to="/contact">
              Talk to our team
              <ArrowRight data-slot="icon" className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Services;
