import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/inputs/Button';
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';

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
  <section id="business" className="section-rhythm w-full border-(--line) bg-(--paper) text-(--ink)">
    <article className="app-container grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
      <header>
        <p className="type-eyebrow">
          For businesses
        </p>
        <h2 className="type-h2 mt-2">
          Logistics
          <br />
          without the
          <br />
          operations team.
        </h2>
        <p className="mt-4 max-w-[480px] text-sm font-normal leading-relaxed text-muted-foreground">
          Switch from in-house dispatch to a Peekaboo plan and consolidate every
          delivery into one billing cycle, one dashboard, and one SLA.
        </p>
        <nav className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            primary
            onClick={onContactClick}
            className="rounded-(--radius-control) font-normal"
          >
            Request business account
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            onClick={onSeePlans}
            className={`rounded-(--radius-control) border-border bg-(--surface) text-foreground`}
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </nav>
      </header>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title}>
              <article className="group h-full rounded-md border border-(--line) bg-(--paper) p-6 transition-[border-color] duration-200 hover:border-(--ink)">
                <PublicIconBadge icon={Icon} tone={publicAccentAt(index)} />
                <h3 className="type-label mt-4">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm font-normal leading-relaxed text-muted-foreground">
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
