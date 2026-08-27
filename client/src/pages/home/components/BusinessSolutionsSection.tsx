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
  <section id="business" className="section-rhythm w-full border-t border-(--line) bg-(--paper) text-(--ink)">
    <article className="app-container grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
      <header>
        <p className="text-[11px] font-medium text-muted-foreground">
          For businesses
        </p>
        <h2 className="mt-3 text-[28px] font-medium leading-[1.05] sm:text-[40px]">
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
            className="rounded-(--radius-control) font-medium"
          >
            Request business account
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            onClick={onSeePlans}
            className={`rounded-(--radius-control) border-border bg-[var(--surface)] text-foreground`}
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </nav>
      </header>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title}>
              <article className="group h-full rounded-(--radius-card) border border-(--line) bg-(--paper) p-6 transition-[border-color] duration-200 hover:border-(--ink)">
                <span className="flex h-9 w-9 items-center justify-center rounded-(--radius-control) bg-(--ink) text-(--paper)">
                  <Icon className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[14px] font-medium">
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
