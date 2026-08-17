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
  <main
    className={cn(
      'min-h-screen bg-[var(--peekaboo-warm)] px-4 py-8 text-[var(--peekaboo-text)] sm:px-6 lg:px-10 lg:py-10',
      className,
    )}
  >
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {children}
    </section>
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
      'overflow-hidden rounded-[var(--radius)] border border-[var(--peekaboo-line)] bg-white px-5 py-6 sm:px-7 sm:py-7',
      className,
    )}
  >
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-['IBM_Plex_Mono'] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--peekaboo-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-3xl font-['Space_Grotesk'] text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--peekaboo-dark)] sm:text-[2.15rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--peekaboo-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
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
      'overflow-hidden rounded-[var(--radius)] border border-[var(--peekaboo-line)] bg-white',
      className,
    )}
  >
    {(title || description || eyebrow || actions) && (
      <header className="flex flex-col gap-3 border-b border-[var(--peekaboo-line)] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="font-['IBM_Plex_Mono'] text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--peekaboo-muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 font-['Space_Grotesk'] text-lg font-semibold tracking-[-0.02em] text-[var(--peekaboo-dark)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-[var(--peekaboo-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>
    )}
    <div className={cn('px-5 py-5 sm:px-6', contentClassName)}>{children}</div>
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
      'rounded-[var(--radius)] border border-[var(--peekaboo-line)] bg-white px-4 py-4',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-['IBM_Plex_Mono'] text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--peekaboo-muted)]">
          {label}
        </p>
        <p className="mt-2 break-words text-sm font-medium text-[var(--peekaboo-dark)]">
          {value}
        </p>
      </div>
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--peekaboo-gray)] text-[var(--peekaboo-dark)]">
          {icon}
        </span>
      ) : null}
    </div>
  </article>
);

export const OrderStageRail = ({ currentStage }: OrderStageRailProps) => {
  const currentIndex = orderStages.findIndex(
    (stage) => stage.key === currentStage,
  );

  return (
    <nav
      aria-label="Order steps"
      className="rounded-[var(--radius)] border border-[var(--peekaboo-line)] bg-white px-5 py-4 sm:px-6"
    >
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
                    'absolute right-1/2 top-1.5 h-px w-full',
                    isReached
                      ? 'bg-[var(--peekaboo-yellow)]'
                      : 'bg-[var(--peekaboo-line)]',
                  )}
                />
              ) : null}
              <div className="relative flex flex-col items-center text-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-3 w-3 rounded-full',
                    isReached
                      ? 'bg-[var(--peekaboo-yellow)]'
                      : 'bg-[var(--peekaboo-line)]',
                  )}
                />
                <span
                  className={cn(
                    "mt-2 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.08em] sm:text-[10px]",
                    isCurrent
                      ? 'font-medium text-[var(--peekaboo-dark)]'
                      : 'text-[var(--peekaboo-muted)]',
                  )}
                >
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
