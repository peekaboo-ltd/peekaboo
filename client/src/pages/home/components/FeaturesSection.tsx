import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
<section className="w-full py-10 lg:py-12">
  <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <li key={action.title}>
            <Link
              type="button"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                action.onClick?.();
              }}
              className="group home-card-interactive relative flex h-full min-h-[150px] w-full flex-col items-start rounded-md p-5 text-left"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 ${
                  action.accent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </span>
              <span
                className={`mt-4 block text-[14px] font-medium ${
                  !action.accent ? 'group-hover:text-foreground' : ''
                }`}
              >
                {action.title}
              </span>
              <span className="mt-1 block text-[12px] font-normal leading-relaxed">
                {action.description}
              </span>
              <span
                className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-medium transition-colors duration-200 ${
                  action.accent
                    ? 'text-primary'
                    : 'text-foreground group-hover:text-[#a68932]'
                }`}
              >
                Open
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </article>
</section>
);

export default FeaturesSection;
