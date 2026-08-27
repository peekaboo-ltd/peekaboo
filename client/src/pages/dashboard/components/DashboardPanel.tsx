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
      className={cn('card-framed', className)}
    >
      <header className="border-b border-(--line) px-4 py-3.5 sm:px-5">
        {eyebrow && <p className="type-eyebrow mb-0.5">{eyebrow}</p>}
        <h2 className="type-card-title">{title}</h2>
        {description && (
          <p className="type-meta mt-0.5 max-w-[56ch]">{description}</p>
        )}
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </div>
  );
};

export default DashboardPanel;
