import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';

interface QuickAction {
  label: string;
  to: string;
  icon: IconProp;
}

interface DashboardQuickActionsProps {
  actions: QuickAction[];
  variants?: Variants;
}

const DashboardQuickActions = ({ actions, variants }: DashboardQuickActionsProps) => {
  if (!actions.length) return null;

  return (
    <motion.div variants={variants}>
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div
          className="flex gap-3 snap-x snap-mandatory"
          style={{ width: 'max-content', minWidth: '100%' }}
        >
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="group flex min-w-[96px] snap-start flex-col items-center gap-2.5 rounded-md border border-(--line) bg-(--paper) px-5 py-4 outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-(--ease-flat) hover:border-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-(--radius-control) bg-(--surface)"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={action.icon}
                  className="text-sm text-(--muted)"
                  aria-hidden="true"
                />
              </span>
              <span className="text-xs font-normal text-(--muted) text-center leading-tight whitespace-nowrap">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardQuickActions;
export type { QuickAction };
