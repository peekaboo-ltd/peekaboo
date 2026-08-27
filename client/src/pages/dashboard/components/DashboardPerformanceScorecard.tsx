import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import DashboardPanel from './DashboardPanel';

interface ScorecardKPI {
  label: string;
  value: string;
  progress: number; // 0–100
  trend?: { value: number; isPositive: boolean };
}

interface DashboardPerformanceScorecardProps {
  kpis?: ScorecardKPI[];
  variants?: Variants;
}

// Placeholder KPIs — replace with real data once backend is wired
const placeholderKPIs: ScorecardKPI[] = [
  {
    label: 'On-Time Rate',
    value: '91.4%',
    progress: 91,
    trend: { value: 3, isPositive: true },
  },
  {
    label: 'Avg. Fulfillment',
    value: '2.4 hrs',
    progress: 72,
    trend: { value: 8, isPositive: false },
  },
  {
    label: 'Completion Rate',
    value: '87.2%',
    progress: 87,
    trend: { value: 2, isPositive: true },
  },
  {
    label: 'Active Zones',
    value: '14',
    progress: 58,
    trend: { value: 1, isPositive: true },
  },
];

const DashboardPerformanceScorecard = ({
  kpis = placeholderKPIs,
  variants,
}: DashboardPerformanceScorecardProps) => {
  return (
    <motion.div variants={variants}>
      <DashboardPanel
        eyebrow="Performance overview"
        title="Operational Scorecard"
        description="Key delivery and fulfillment indicators. Backend integration pending."
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="rounded-(--radius-card) border border-(--line) bg-(--paper) p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-medium text-(--muted) leading-snug">
                  {kpi.label}
                </p>
                {kpi.trend && (
                  <span
                    className={`shrink-0 flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                      kpi.trend.isPositive
                        ? 'bg-(--surface) text-(--ink)'
                        : 'bg-(--surface) text-(--ink)'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={kpi.trend.isPositive ? faArrowTrendUp : faArrowTrendDown}
                      className="text-[9px]"
                      aria-hidden="true"
                    />
                    {kpi.trend.value}%
                  </span>
                )}
              </div>

              <p className="text-2xl leading-none text-(--ink) mb-3">
                {kpi.value}
              </p>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-[var(--surface)]">
                <div
                  className="h-full rounded-full bg-(--ink) opacity-60"
                  style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </DashboardPanel>
    </motion.div>
  );
};

export default DashboardPerformanceScorecard;
