import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/inputs/Button';

interface BusinessFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface BusinessSolutionsSectionProps {
  features: BusinessFeature[];
  onContactClick?: () => void;
  onSeePlans?: () => void;
}

const BusinessSolutionsSection = ({
  features,
  onContactClick,
  onSeePlans,
}: BusinessSolutionsSectionProps) => (
  <section id="business" className="w-full border-t border-border bg-[color-mix(in_oklab,var(--secondary)_9%,var(--peekaboo-warm))] py-12 text-foreground lg:py-16">
    <article className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:px-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          For businesses
        </p>
        <h2 className="mt-3 text-[28px] font-semibold leading-[1.05] tracking-[-0.01em] sm:text-[40px]">
          Logistics
          <br />
          without the
          <br />
          operations team.
        </h2>
        <p className="mt-4 max-w-[480px] text-[13px] font-normal leading-relaxed text-muted-foreground">
          Switch from in-house dispatch to a Peekaboo plan and consolidate every
          delivery into one billing cycle, one dashboard, and one SLA.
        </p>
        <nav className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            primary
            onClick={onContactClick}
            className="rounded-md font-medium"
          >
            Request business account
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            onClick={onSeePlans}
            className="rounded-md border-border bg-card text-foreground transition-all duration-300 hover:bg-accent hover:border-border hover:shadow-[0_2px_8px_-4px_rgba(10,10,10,0.12)]"
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Button>
        </nav>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title}>
              <article className="home-card-interactive group h-full rounded-md border border-border bg-card p-5 text-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0a0a0a] text-[#edb100] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#edb100] group-hover:text-[#0a0a0a]">
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[14px] font-medium tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13px] font-normal leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </article>
  </section>
);

export default BusinessSolutionsSection;
