import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InternalPageProps {
  children: ReactNode;
  className?: string;
}

interface InternalPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

interface InternalSectionCardProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

interface InternalStatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const InternalPage = ({ children, className }: InternalPageProps) => (
  <main className={cn('w-full flex flex-col gap-4', className)}>{children}</main>
);

export const InternalPageHeader = ({
  title,
  description,
  eyebrow,
  actions,
  className,
}: InternalPageHeaderProps) => (
  <header
    className={cn(
      'flex flex-col gap-3 border border-slate-200 bg-[var(--peekaboo-surface)] px-5 py-5 sm:px-6',
      className
    )}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] uppercase text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-medium text-slate-900 sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  </header>
);

export const InternalSectionCard = ({
  children,
  title,
  description,
  eyebrow,
  actions,
  className,
  contentClassName,
}: InternalSectionCardProps) => (
  <section className={cn('border border-slate-200 bg-[var(--peekaboo-surface)]', className)}>
    {(title || description || eyebrow || actions) && (
      <header className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] uppercase text-slate-500">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 text-lg font-medium text-slate-900">{title}</h2>
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

export const InternalStatCard = ({
  label,
  value,
  icon,
  className,
}: InternalStatCardProps) => (
  <article
    className={cn(
      'border border-slate-200 bg-[var(--peekaboo-surface)] px-5 py-4 flex items-start justify-between gap-4',
      className
    )}
  >
    <div className="min-w-0">
      <p className="text-[11px] uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-medium text-slate-900 break-words">{value}</p>
    </div>
    {icon ? (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[var(--peekaboo-surface)] text-slate-700">
        {icon}
      </span>
    ) : null}
  </article>
);
