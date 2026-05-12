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
  <section className="w-full bg-[#f7f6f1] py-8 lg:py-10">
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
                className={`group flex h-full min-h-[160px] w-full flex-col items-start rounded-[18px] border p-5 text-left transition duration-200 hover:-translate-y-px ${
                  action.accent
                    ? 'border-transparent bg-[#0a0a0a] text-white'
                    : 'border-[#ececea] bg-white text-[#0a0a0a] hover:border-[#d9d8d4]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    action.accent ? 'bg-[#ffc400] text-[#0a0a0a]' : 'bg-[#fff4be] text-[#0a0a0a]'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="mt-4 block text-[14px] font-bold tracking-[-0.01em]">
                  {action.title}
                </span>
                <span
                  className={`mt-1 block text-[12px] leading-relaxed ${
                    action.accent ? 'text-white/65' : 'text-[#6b6f76]'
                  }`}
                >
                  {action.description}
                </span>
                <span
                  className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-semibold ${
                    action.accent ? 'text-[#ffc400]' : 'text-[#0a0a0a]'
                  }`}
                >
                  Open
                  <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
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
