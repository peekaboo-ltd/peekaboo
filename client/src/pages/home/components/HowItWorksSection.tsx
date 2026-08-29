import { ArrowRight } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { HowItWorksStep } from '../home.types';
import { Button } from '@/components/ui/button';
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';
import { useI18n } from '@/i18n/i18n';

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
  onScrollToForm: () => void;
}

type StepIcon = ComponentType<SVGProps<SVGSVGElement> & { 'aria-hidden'?: boolean }>;

const HowItWorksSection = ({ steps, onScrollToForm }: HowItWorksSectionProps) => {
  const { t } = useI18n();
  return (
  <section id="how-it-works" className="section-rhythm w-full border-(--line) bg-(--paper)">
    <div className="app-container">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <hgroup>
          <p className="type-eyebrow">{t('home.how.eyebrow')}</p>
          <h2 className="type-h2 mt-2">
            {t('home.how.title')}
          </h2>
        </hgroup>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
            {t('home.how.description')}
          </p>
          <Button type="button" onClick={onScrollToForm} className="link-arrow">
            {t('home.how.action')}
            <ArrowRight data-slot="icon" className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon as StepIcon;
          return (
            <li key={step.step} className="relative rounded-md border border-(--line) p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="type-meta">0{index + 1}</span>
                <PublicIconBadge
                  icon={Icon}
                  tone={publicAccentAt(index)}
                  size="md"
                />
              </div>
              <h3 className="type-h3 mt-8">{step.title}</h3>
              <p className="mt-3 text-sm leading-[1.55] text-(--muted)">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
  );
};

export default HowItWorksSection;
