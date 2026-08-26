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
        'rounded-xl border border-[color:var(--ops-line)] bg-[var(--peekaboo-surface)] p-0 shadow-[0_1px_0_rgba(20,24,29,0.05)]',
        className,
      )}
    >
      <header className="border-b border-[color:var(--ops-line)] px-4 py-4 sm:px-6">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-medium uppercase text-slate-500">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-medium text-[color:var(--ops-ink)]">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 max-w-[56ch] text-sm text-slate-600">{description}</p>
        )}
      </header>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </div>
  );
};

export default DashboardPanel;
