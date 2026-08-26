import { ArrowRight } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { HowItWorksStep } from '../home.types';
import { Button } from '@/components/ui/button';

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
  onScrollToForm: () => void;
}

type StepIcon = ComponentType<SVGProps<SVGSVGElement> & { 'aria-hidden'?: boolean }>;

const HowItWorksSection = ({ steps, onScrollToForm }: HowItWorksSectionProps) => (
  <section id="how-it-works" className="section-rhythm w-full border-t border-[--line] bg-[--paper]">
    <div className="app-container">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <hgroup>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">How it works</p>
          <h2 className="mt-3 text-[clamp(1.75rem,1.3rem+1.8vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em]">
            Three steps. One delivery.
          </h2>
        </hgroup>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <p className="max-w-[46ch] text-sm leading-[1.55] text-[--muted]">
            Designed for senders who do not have time to think about logistics.
          </p>
          <Button type="button" onClick={onScrollToForm} className="link-arrow">
            See it in action
            <ArrowRight data-slot="icon" className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon as StepIcon;
          return (
            <li key={step.step} className="relative rounded-[--radius-card] border border-[--line] p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-[--muted]">0{index + 1}</span>
                <span className="flex size-10 items-center justify-center rounded-[--radius-control] border border-[--ink]">
                  <Icon className="size-4" aria-hidden={true} />
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-medium leading-[1.25] tracking-[-0.015em]">{step.title}</h3>
              <p className="mt-3 text-sm leading-[1.55] text-[--muted]">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);

export default HowItWorksSection;
