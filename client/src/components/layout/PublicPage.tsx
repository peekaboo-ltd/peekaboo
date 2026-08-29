import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicPageProps {
  children: ReactNode;
  className?: string;
  /**
   * Lock the page to one screen instead of letting it grow.
   *
   * The default stack is a floor (`min-h-screen` + `section-rhythm`), which is
   * right for a page that scrolls. A page whose brief is "everything visible at
   * once" needs a ceiling, and `section-rhythm` is a custom utility, so its
   * 112px of padding-block cannot be overridden from a className.
   *
   * 64px is the sticky header (DESIGN.md §4). The single `overflow-y-auto`
   * child is the AuthPageShell pattern: below the guaranteed height the content
   * column scrolls inside the viewport rather than pushing anything off it.
   */
  viewport?: boolean;
  contentClassName?: string;
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

export const PublicPage = ({
  children,
  className,
  viewport = false,
  contentClassName,
}: PublicPageProps) => (
  <main
    className={cn(
      'bg-(--paper) text-(--ink)',
      viewport
        ? 'h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden max-lg:h-auto max-lg:max-h-none max-lg:overflow-visible'
        : 'min-h-screen',
      className,
    )}
  >
    <div
      className={cn(
        'app-container flex flex-col',
        viewport
          ? 'h-full min-h-0 gap-4 py-5 max-lg:h-auto max-lg:py-8'
          : 'section-rhythm gap-6',
        contentClassName,
      )}
    >
      {children}
    </div>
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
      'border-b border-(--line) pb-10 md:pb-12',
      className,
    )}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="type-eyebrow">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="type-display mt-2 max-w-[20ch]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-[68ch] text-base leading-[1.6] text-(--muted)">
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
      'card-framed overflow-hidden',
      className,
    )}
  >
    {title || description || eyebrow || actions ? (
      <header className="border-b border-(--line) p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="type-eyebrow">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="type-card-title mt-1">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="type-meta mt-1 max-w-[68ch]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </header>
    ) : null}
    <div className={cn('p-5', contentClassName)}>{children}</div>
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
      'card-quiet p-5',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="type-eyebrow">{label}</p>
        <p className="type-metric mt-2 break-words">{value}</p>
      </div>
      {icon ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) bg-(--paper) text-(--ink)">
          {icon}
        </span>
      ) : null}
    </div>
  </article>
);
