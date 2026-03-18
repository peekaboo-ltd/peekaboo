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
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)] sm:p-6',
        className,
      )}
    >
      <header className="mb-4">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </header>
      {children}
    </div>
  );
};

export default DashboardPanel;
