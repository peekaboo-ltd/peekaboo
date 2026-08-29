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
      return 'bg-(--surface) text-(--ink) border-(--line)';
    case 'PENDING':
    case 'ACTION_REQUIRED':
    case 'SUBMITTED':
      return 'bg-(--surface) text-(--ink) border-(--line)';
    case 'CANCELLED':
    case 'REJECTED':
    case 'INACTIVE':
      return 'bg-(--surface) text-(--ink) border-(--line)';
    default:
      return 'bg-(--surface) text-(--ink) border-(--line)';
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
          <div className="overflow-hidden rounded-md bg-(--surface)">
            <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-(--line) px-5 py-3 text-xs font-normal text-(--muted) sm:grid">
              <span>Activity</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            <ul>
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 border-b border-(--line) px-5 py-4 last:border-b-0 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-normal text-(--ink)">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-(--muted)">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-(--surface) px-2.5 py-1 text-xs font-normal text-(--muted)">
                      {item.type}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-normal ${statusTone(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <time className="text-sm text-(--muted)">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-(--line) bg-(--surface) px-5 py-12 text-center">
            <p className="text-base font-normal text-(--ink)">No recent activity yet</p>
            <p className="mt-2 text-sm text-(--muted)">
              As new orders or assignments land, they will appear here.
            </p>
          </div>
        )}
      </DashboardPanel>
    </motion.div>
  );
};

export default DashboardActivityPanel;
