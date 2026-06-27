import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/inputs/Button';

interface QuickAction {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: boolean;
  onClick?: () => void;
}

interface FeaturesSectionProps {
  actions: QuickAction[];
}

const FeaturesSection = ({ actions }: FeaturesSectionProps) => (
  <section className="w-full bg-[var(--peekaboo-warm)] py-10 lg:py-12">
    <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.title}>
              <Button
                type="button"
                styled={false}
                onClick={action.onClick}
                className={`group flex h-full min-h-[150px] w-full flex-col items-start rounded-[12px] border p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ${
                  action.accent
                    ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white hover:-translate-y-0.5 hover:border-[#edb100] hover:bg-[#141414] hover:shadow-[0_18px_36px_-24px_rgba(10,10,10,0.55)]'
                    : 'border-[#ececea] bg-white text-[#0a0a0a] hover:-translate-y-0.5 hover:border-[#d49e00] hover:shadow-[0_18px_36px_-26px_rgba(10,10,10,0.32)]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors duration-200 ${
                    action.accent
                      ? 'bg-[#edb100] text-[#0a0a0a]'
                      : 'bg-[#fff4be] text-[#0a0a0a] group-hover:bg-[#edb100]'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="mt-4 block text-[14px] font-bold tracking-[-0.01em]">
                  {action.title}
                </span>
                <span
                  className={`mt-1 block text-[12px] leading-relaxed ${
                    action.accent ? 'text-white/70' : 'text-[#6b6f76]'
                  }`}
                >
                  {action.description}
                </span>
                <span
                  className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-semibold ${
                    action.accent ? 'text-[#edb100]' : 'text-[#0a0a0a]'
                  }`}
                >
                  Open
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </article>
  </section>
);

export default FeaturesSection;
