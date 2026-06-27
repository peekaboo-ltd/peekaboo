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
  <section id="business" className="w-full border-t border-[#ececea] bg-[#edb100] py-12 text-[#0a0a0a] lg:py-16">
    <article className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:px-10">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/60">
          For businesses
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-[40px]">
          Logistics
          <br />
          without the
          <br />
          operations team.
        </h2>
        <p className="mt-4 max-w-[480px] text-[13px] leading-relaxed text-black/70">
          Switch from in-house dispatch to a Peekaboo plan and consolidate every
          delivery into one billing cycle, one dashboard, and one SLA.
        </p>
        <nav className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            primary
            onClick={onContactClick}
            className="rounded-full font-semibold"
          >
            Request business account
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            onClick={onSeePlans}
            className="rounded-full bg-black/[0.06] border-transparent text-[#0a0a0a] hover:bg-black/10 hover:border-transparent"
          >
            See plans
          </Button>
        </nav>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title}>
              <article className="h-full rounded-[12px] border border-black/10 bg-white/80 p-5 text-[#0a0a0a]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0a0a0a] text-[#edb100]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[14px] font-bold tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-black/65">
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
