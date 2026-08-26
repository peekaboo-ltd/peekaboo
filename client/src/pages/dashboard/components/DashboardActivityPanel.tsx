import { motion, type Variants } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { RecentActivity } from '@/types/dashboard.type';
import DashboardPanel from './DashboardPanel';

interface DashboardActivityPanelProps {
  items: RecentActivity[];
  variants?: Variants;
}

const statusTone = (status?: string) => {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
    case 'RECEIVED':
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'PENDING':
    case 'ACTION_REQUIRED':
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'CANCELLED':
    case 'REJECTED':
    case 'INACTIVE':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-[var(--peekaboo-surface)] text-slate-700 border-slate-200';
  }
};

const DashboardActivityPanel = ({ items, variants }: DashboardActivityPanelProps) => {
  const rows = items.slice(0, 6);

  return (
    <motion.div variants={variants}>
      <DashboardPanel
        eyebrow="Activity feed"
        title="Recent movement"
        description="A compact stream of the latest orders, assignments, and payment-related updates."
        className="rounded-lg"
      >
        {rows.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-[color:var(--ops-line)] bg-[var(--peekaboo-surface)]">
            <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-[color:var(--ops-line)] px-5 py-3 text-[11px] font-medium uppercase text-slate-500 sm:grid">
              <span>Activity</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            <ul>
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 border-b border-[color:var(--ops-line)] px-5 py-4 last:border-b-0 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-normal text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-[var(--peekaboo-surface)] px-2.5 py-1 text-[11px] font-normal uppercase text-slate-600">
                      {item.type}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-normal ${statusTone(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <time className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[color:var(--ops-line)] bg-[var(--peekaboo-surface)] px-5 py-12 text-center">
            <p className="text-base font-normal text-slate-900">No recent activity yet</p>
            <p className="mt-2 text-sm text-slate-500">
              As new orders or assignments land, they will appear here.
            </p>
          </div>
        )}
      </DashboardPanel>
    </motion.div>
  );
};

export default DashboardActivityPanel;
