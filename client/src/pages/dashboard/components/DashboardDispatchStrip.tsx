import { motion, type Variants } from 'framer-motion';

export interface DispatchStripItem {
  label: string;
  value: string;
  status: 'up' | 'watch' | 'down';
}

interface DashboardDispatchStripProps {
  items: DispatchStripItem[];
  variants?: Variants;
}

const toneByStatus: Record<DispatchStripItem['status'], string> = {
  up: 'bg-[--ink]',
  watch: 'border border-[--ink] bg-transparent',
  down: 'rotate-45 bg-[--ink]',
};

const DashboardDispatchStrip = ({ items, variants }: DashboardDispatchStripProps) => {
  if (!items.length) return null;

  return (
    <motion.section
      variants={variants}
      aria-label="Dispatch strip"
      className="overflow-x-auto rounded-[--radius-card] border border-[--line] bg-[--paper] px-3 py-3 sm:px-4"
    >
      <div className="flex min-w-full gap-3">
        {items.map((item) => (
          <article
            key={item.label}
            className="min-w-[150px] flex-1 rounded-md border border-[color:var(--line)] bg-[var(--surface)] px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${toneByStatus[item.status]}`} aria-hidden="true" />
              <p className="truncate text-[11px] font-medium uppercase text-[--muted]">
                {item.label}
              </p>
            </div>
            <p className="mt-1 truncate text-xl font-medium text-[color:var(--ink)]">
              {item.value}
            </p>
          </article>
        ))}
      </div>
    </motion.section>
  );
};

export default DashboardDispatchStrip;
