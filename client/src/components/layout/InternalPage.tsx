import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InternalPageProps { children: ReactNode; className?: string }
interface InternalPageHeaderProps {
  title: ReactNode; description?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode; className?: string;
}
interface InternalSectionCardProps {
  children: ReactNode; title?: ReactNode; description?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode; className?: string; contentClassName?: string;
}
interface InternalStatCardProps { label: ReactNode; value: ReactNode; icon?: ReactNode; className?: string }

export const InternalPage = ({ children, className }: InternalPageProps) => (
  <main className={cn('flex w-full flex-col gap-6', className)}>{children}</main>
);

export const InternalPageHeader = ({ title, description, eyebrow, actions, className }: InternalPageHeaderProps) => (
  <header className={cn('border-b border-[--line] pb-8', className)}>
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">{eyebrow}</p> : null}
        <h1 className="mt-2 text-[clamp(1.75rem,1.3rem+1.8vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em]">{title}</h1>
        {description ? <p className="mt-3 max-w-[68ch] text-sm leading-[1.55] text-[--muted]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  </header>
);

export const InternalSectionCard = ({ children, title, description, eyebrow, actions, className, contentClassName }: InternalSectionCardProps) => (
  <section className={cn('overflow-hidden rounded-[--radius-card] border border-[--line] bg-[--paper]', className)}>
    {title || description || eyebrow || actions ? (
      <header className="border-b border-[--line] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">{eyebrow}</p> : null}
            {title ? <h2 className="mt-1 text-lg font-medium leading-[1.4] tracking-[-0.01em]">{title}</h2> : null}
            {description ? <p className="mt-1 max-w-[68ch] text-sm text-[--muted]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </header>
    ) : null}
    <div className={cn('p-6', contentClassName)}>{children}</div>
  </section>
);

export const InternalStatCard = ({ label, value, icon, className }: InternalStatCardProps) => (
  <article className={cn('flex items-start justify-between gap-4 rounded-[--radius-card] bg-[--surface] p-6', className)}>
    <div className="min-w-0">
      <p className="text-xs font-medium text-[--muted]">{label}</p>
      <p className="mt-2 break-words text-2xl font-medium tracking-[-0.015em] tabular-nums">{value}</p>
    </div>
    {icon ? <span className="flex size-10 shrink-0 items-center justify-center rounded-[--radius-control] border border-[--ink]">{icon}</span> : null}
  </article>
);
