import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicPageProps {
  children: ReactNode;
  className?: string;
}

interface PublicPageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

interface PublicSectionCardProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

interface PublicStatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}

type OrderStage = 'locations' | 'payment' | 'tracking';

interface OrderStageRailProps {
  currentStage: OrderStage;
}

const orderStages: Array<{ key: OrderStage; label: string }> = [
  { key: 'locations', label: 'Locations' },
  { key: 'payment', label: 'Payment' },
  { key: 'tracking', label: 'Tracking' },
];

export const PublicPage = ({ children, className }: PublicPageProps) => (
  <main className={cn('min-h-screen bg-[--paper] text-[--ink]', className)}>
    <div className="app-container section-rhythm flex flex-col gap-6">{children}</div>
  </main>
);

export const PublicPageHero = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PublicPageHeroProps) => (
  <header
    className={cn(
      'border-b border-[--line] pb-10 md:pb-12',
      className,
    )}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-[20ch] text-[clamp(2.5rem,1.6rem+3.6vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.03em]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-[68ch] text-base leading-[1.6] text-[--muted]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  </header>
);

export const PublicSectionCard = ({
  children,
  title,
  description,
  eyebrow,
  actions,
  className,
  contentClassName,
}: PublicSectionCardProps) => (
  <section
    className={cn(
      'overflow-hidden rounded-[--radius-card] border border-[--line] bg-[--paper]',
      className,
    )}
  >
    {title || description || eyebrow || actions ? (
      <header className="border-b border-[--line] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 text-lg font-medium leading-[1.4] tracking-[-0.01em]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-[68ch] text-sm text-[--muted]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </header>
    ) : null}
    <div className={cn('p-6', contentClassName)}>{children}</div>
  </section>
);

export const PublicStatCard = ({
  label,
  value,
  icon,
  className,
}: PublicStatCardProps) => (
  <article
    className={cn(
      'rounded-[--radius-card] bg-[--surface] p-6',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">{label}</p>
        <p className="mt-2 break-words text-lg font-medium tabular-nums">{value}</p>
      </div>
      {icon ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[--radius-control] border border-[--ink]">
          {icon}
        </span>
      ) : null}
    </div>
  </article>
);

export const OrderStageRail = ({ currentStage }: OrderStageRailProps) => {
  const currentIndex = orderStages.findIndex((stage) => stage.key === currentStage);

  return (
    <nav aria-label="Order steps" className="rounded-[--radius-card] border border-[--line] p-6">
      <ol className="grid grid-cols-3">
        {orderStages.map((stage, index) => {
          const isReached = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={stage.key}
              className="relative min-w-0"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute right-1/2 top-3 h-px w-full',
                    isReached ? 'bg-[--ink]' : 'bg-[--line]',
                  )}
                />
              ) : null}
              <div className="relative flex flex-col items-center text-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-6 items-center justify-center rounded-[--radius-pill] border text-xs',
                    isCurrent
                      ? 'border-[--ink] bg-[--ink] text-[--paper]'
                      : isReached
                        ? 'border-[--ink] bg-[--paper] text-[--ink]'
                        : 'border-dashed border-[--line-strong] text-[--muted]',
                  )}
                >
                  {index + 1}
                </span>
                <span className={cn('mt-2 text-xs', isCurrent ? 'font-medium text-[--ink]' : 'text-[--muted]')}>
                  {stage.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
