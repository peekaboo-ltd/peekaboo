import { motion, type Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import type { DashboardActionLink, MetricCardData } from '@/types/dashboard.type';
import DashboardPanel from './DashboardPanel';

interface DashboardContextPanelProps {
  title: string;
  description: string;
  highlights: MetricCardData[];
  actions: DashboardActionLink[];
  variants?: Variants;
}

const DashboardContextPanel = ({
  title,
  description,
  highlights,
  actions,
  variants,
}: DashboardContextPanelProps) => {
  return (
    <motion.div variants={variants}>
      <DashboardPanel
        eyebrow="Context"
        title={title}
        description={description}
        className="h-full rounded-lg"
      >
        <div className="space-y-4">
          {highlights.length > 0 && (
            <div className="grid gap-3">
              {highlights.slice(0, 4).map((item) => (
                <article
                  key={item.label}
                  className="rounded-md border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-[11px] font-normal uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                    {item.value}
                  </p>
                  {(item.footerText || item.comparisonLabel) && (
                    <p className="mt-1 text-sm text-slate-500">
                      {item.footerText || item.comparisonLabel}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-normal uppercase tracking-[0.16em] text-slate-500">
                Quick actions
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {actions.slice(0, 4).map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                  >
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={action.icon} className="text-xs text-slate-500" />
                      {action.label}
                    </span>
                    <span className="text-slate-400">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-normal text-slate-900">Focused workspace</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the signals on the left to spot movement, then jump into one of the shortcuts here to act on it without leaving the dashboard flow.
            </p>
          </div>
        </div>
      </DashboardPanel>
    </motion.div>
  );
};

export default DashboardContextPanel;
