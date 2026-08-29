import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';
import { useI18n } from '@/i18n/i18n';

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

const FeaturesSection = ({ actions }: FeaturesSectionProps) => {
const { t } = useI18n();
return (
<section className="section-rhythm w-full border-(--line) bg-(--paper)">
  <article className="app-container">
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        const tone = publicAccentAt(index);
        return (
          <li key={action.title}>
            <Link
              type="button"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                action.onClick?.();
              }}
              className="group relative flex h-full min-h-[150px] w-full flex-col items-start rounded-md border border-(--line) p-6 text-left transition-[border-color] duration-200 hover:border-(--ink)"
            >
              <PublicIconBadge icon={Icon} tone={tone} />
              <span
                className={`mt-4 block text-[14px] font-normal ${
                  !action.accent ? 'group-hover:text-foreground' : ''
                }`}
              >
                {action.title}
              </span>
              <span className="mt-1 block text-xs font-normal leading-relaxed">
                {action.description}
              </span>
              <span
                className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-normal transition-colors duration-200 ${
                  action.accent
                    ? 'text-(--ink)'
                    : 'text-foreground group-hover:text-(--muted)'
                }`}
              >
                {t('home.features.open')}
                <ArrowRight className="h-3 w-3 transition-transform duration-200" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </article>
</section>
);
};

export default FeaturesSection;
