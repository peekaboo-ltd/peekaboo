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

export const PublicPage = ({ children, className }: PublicPageProps) => (
  <main
    className={cn(
      'min-h-screen bg-[#FAFAF7] px-4 py-8 sm:px-6 lg:px-10',
      className,
    )}
  >
    <section className={cn(
      'mx-auto flex w-full max-w-6xl flex-col gap-4',
      className,
    )}>
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
      'overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-5 sm:px-6 sm:py-6',
      className,
    )}
  >
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
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
      'overflow-hidden rounded-[20px] border border-slate-200 bg-white',
      className,
    )}
  >
    {(title || description || eyebrow || actions) && (
      <header className="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
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
      'rounded-[18px] border border-slate-200 bg-white px-4 py-4',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-xl font-semibold text-slate-900 break-words">
          {value}
        </p>
      </div>
      {icon ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </span>
      ) : null}
    </div>
  </article>
);
