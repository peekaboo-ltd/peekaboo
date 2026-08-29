import { motion, type Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { DashboardActionLink, MetricCardData } from '@/types/dashboard.type';
import DashboardPanel from './DashboardPanel';
import Button from '@/components/inputs/Button';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

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
                  className="rounded-md bg-(--surface) px-4 py-3"
                >
                  <p className="type-eyebrow">
                    {item.label}
                  </p>
                  <p className="type-metric mt-2">
                    {item.value}
                  </p>
                  {(item.footerText || item.comparisonLabel) && (
                    <p className="mt-1 text-sm text-(--muted)">
                      {item.footerText || item.comparisonLabel}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div className="rounded-md bg-(--surface) p-4">
              <p className="type-eyebrow">
                Quick actions
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {actions.slice(0, 4).map((action) => (
                  <Button
                    key={action.label}
                    variant='outline'
                    className='border border-(--line) bg-(--surface) hover:bg-(--surface-hover)'
                  >
                      <span className='w-full flex items-center justify-start gap-2'>
                      <FontAwesomeIcon icon={action.icon} className="type-meta" />
                      {action.label}
                      </span>
                      <FontAwesomeIcon icon={faChevronRight} className="type-meta" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-md bg-(--surface) px-4 py-5">
            <p className="text-sm font-normal text-(--ink)">Focused workspace</p>
            <p className="mt-2 text-sm leading-6 text-(--muted)">
              Use the signals on the left to spot movement, then jump into one of the shortcuts here to act on it without leaving the dashboard flow.
            </p>
          </div>
        </div>
      </DashboardPanel>
    </motion.div>
  );
};

export default DashboardContextPanel;
