import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardPanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const DashboardPanel = ({
  eyebrow,
  title,
  description,
  children,
  className,
}: DashboardPanelProps) => {
  return (
    <div
      className={cn(
        'rounded-(--radius-card) border border-(--line) bg-(--paper) p-0',
        className,
      )}
    >
      <header className="border-b border-[color:var(--line)] px-4 py-4 sm:px-6">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-medium text-(--muted)">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-medium text-[color:var(--ink)]">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 max-w-[56ch] text-sm text-(--muted)">{description}</p>
        )}
      </header>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </div>
  );
};

export default DashboardPanel;
