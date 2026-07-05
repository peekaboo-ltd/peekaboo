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
                className={`group relative flex h-full min-h-[150px] w-full flex-col items-start rounded-[12px] border p-5 text-left transition-all duration-300 ${
                  action.accent
                    ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white hover:border-[#edb100] hover:bg-[#1a1a1a] hover:shadow-[0_12px_32px_-8px_rgba(237,177,0,0.35)]'
                    : 'border-[#ececea] bg-white text-[#0a0a0a] hover:border-[#d49e00] hover:bg-[#fafaf8] hover:shadow-[0_12px_32px_-8px_rgba(10,10,10,0.12)]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition-all duration-300 ${
                    action.accent
                      ? 'bg-[#edb100] text-[#0a0a0a]'
                      : 'bg-[#fff4be] text-[#0a0a0a] group-hover:bg-[#edb100]'
                  }`}
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
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
                  className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-semibold transition-opacity duration-300 ${
                    action.accent ? 'text-[#edb100]' : 'text-[#0a0a0a]'
                  }`}
                >
                  Open
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
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
