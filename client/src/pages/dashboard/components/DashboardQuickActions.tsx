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
              className="group snap-start flex flex-col items-center gap-2.5 rounded-[22px] bg-[var(--peekaboo-surface)] px-5 py-4 transition-all duration-200 hover:-translate-y-[2px] hover:bg-[var(--peekaboo-surface)] min-w-[96px]"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--peekaboo-surface)] transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={action.icon}
                  className="text-sm text-[#3D5564]"
                  aria-hidden="true"
                />
              </span>
              <span className="text-[11px] font-medium text-[color:rgba(37,52,63,0.72)] text-center leading-tight whitespace-nowrap">
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
