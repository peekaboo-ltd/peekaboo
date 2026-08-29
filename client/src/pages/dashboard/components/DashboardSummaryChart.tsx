import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { DashboardStatusBreakdownItem } from '@/types/dashboard.type';
import SeriesChart from '@/components/charts/SeriesChart';
import Sparkline from '@/components/charts/Sparkline';
import type { DashboardSupportCardData } from '@/types/dashboard.type';
import { capitalizeString, formatCurrency, formatNumbers } from '@/utils/strings.util';
import { RoleTypes } from '@/types/auth.type';
import Select from '@/components/inputs/Select';

const getMetricOptionsForRole = (role?: RoleTypes): string[] => {
  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      return ['ORDERS', 'REVENUE', 'ACTIVE_USERS'];
    case RoleTypes.BUSINESS:
      return ['ORDERS'];
    case RoleTypes.RIDER:
      return ['DELIVERIES'];
    case RoleTypes.CUSTOMER:
    default:
      return ['ORDERS'];
  }
};

const formatLabel = (label: unknown): string => {
  if (typeof label !== 'string') return '';
  if (label.includes('-W')) {
    return `W${parseInt(label.split('-W')[1], 10)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, month, day] = label.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
  }
  return label;
};

interface DashboardSummaryChartProps {
  range: '7d' | '30d' | '90d';
  metric: string;
  onRangeChange: (value: '7d' | '30d' | '90d') => void;
  onMetricChange: (value: string) => void;
  data: Array<{ name: string; value: number }>;
  role?: RoleTypes;
  isLoading?: boolean;
  /** Secondary readings, shown as this panel's footer. */
  widgets?: DashboardSupportCardData[];
  breakdown?: DashboardStatusBreakdownItem[];
  containerVariants?: Variants;
  itemVariants?: Variants;
}

const DashboardSummaryChart = ({
  range,
  metric,
  onRangeChange,
  onMetricChange,
  data,
  role,
  isLoading,
  widgets = [],
  breakdown = [],
  containerVariants,
  itemVariants,
}: DashboardSummaryChartProps) => {
  const metricOptions = getMetricOptionsForRole(role);
  const isRevenue = metric === 'REVENUE';

  const total = useMemo(
    () => data.reduce((sum, point) => sum + point.value, 0),
    [data],
  );

  const formattedTotal = useMemo(
    () => (isRevenue ? formatCurrency(total) : formatNumbers(total)),
    [isRevenue, total],
  );

  const peakPoint = useMemo(() => {
    if (!data.length) return undefined;
    return data.reduce((peak, point) => (point.value > peak.value ? point : peak), data[0]);
  }, [data]);

  return (
    <motion.section
      aria-label="Summary chart"
      className="overflow-hidden rounded-md border border-(--line) bg-(--paper) p-5 sm:p-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="type-eyebrow">
              Primary insight
            </p>
            {data.length > 0 ? (
              <p className="type-metric mt-2 text-[2rem] sm:text-[2.5rem]">
                {formattedTotal}
              </p>
            ) : (
              <p className="type-metric mt-2 text-[2rem] text-(--muted) sm:text-[2.5rem]">
                —
              </p>
            )}
            <p className="mt-2 text-sm text-(--muted)">
              {capitalizeString(metric.toLowerCase())} across the selected period with a single high-signal trend line.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-(--surface) px-3 py-1 text-xs font-normal text-(--ink)">
                {range.toUpperCase()} view
              </span>
              <span className="rounded-full bg-(--surface) px-3 py-1 text-xs font-normal text-(--muted)">
                {data.length} data points
              </span>
              {peakPoint && (
                <span className="rounded-full bg-(--surface) px-3 py-1 text-xs font-normal text-(--ink)">
                  Peak {formatLabel(peakPoint.name)}
                </span>
              )}
            </div>
          </div>

          <ul className="flex items-center gap-1 rounded-(--radius-pill) xl:shrink-0">
            {(['7d', '30d', '90d'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onRangeChange(key)}
                aria-pressed={range === key}
                className={`h-8 cursor-pointer rounded-(--radius-pill) px-3 text-xs font-medium transition-[background-color,color] duration-200 ease-(--ease-flat) ${
                  range === key
                    ? 'bg-(--ink) text-(--paper)'
                    : 'text-(--muted) hover:bg-(--surface)'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
            <Select
              value={metric}
              onChange={(value) => onMetricChange(value)}
              options={metricOptions.map((option) => ({
                label: capitalizeString(option),
                value: option,
              }))}
              placeholder="Metric"
              className="w-[140px] cursor-pointer inline-flex items-center gap-2"
            />
          </ul>
        </header>

        <section className="relative mt-8 h-64 sm:h-72">
          {isLoading && (
            <figure className="absolute inset-0 z-10 flex items-center justify-center rounded-(--radius-card) bg-(--surface)">
              <figure className="h-5 w-5 animate-spin rounded-full border-2 border-(--line) border-t-(--ink)" />
            </figure>
          )}
          <SeriesChart
            data={data}
            kind="area"
            series={1}
            height={272}
            ariaLabel={`${capitalizeString(metric.toLowerCase())} over the last ${range}`}
          />
        </section>

        {widgets.length > 0 ? (
          <section className="mt-5 grid gap-3 border-t border-(--line) pt-4 sm:grid-cols-3">
            {widgets.slice(0, 3).map((widget) => (
              <article key={widget.title} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="type-meta truncate">{widget.title}</p>
                  <p className="mt-1 text-lg font-medium tabular">{widget.value}</p>
                </div>
                {widget.data && widget.data.length > 0 && (
                  <Sparkline
                    values={widget.data.map((point) => point.value)}
                    kind={widget.chartType === 'bar' ? 'bar' : 'line'}
                    series={2}
                    width={64}
                    height={32}
                    ariaLabel={`${widget.title} trend`}
                  />
                )}
              </article>
            ))}
          </section>
        ) : breakdown.length > 0 ? (
          <section className="mt-5 grid gap-3 border-t border-(--line) pt-4 sm:grid-cols-3">
            {breakdown.slice(0, 3).map((item) => (
              <article key={item.label}>
                <p className="type-meta">{item.label}</p>
                <p className="mt-1 text-lg font-medium tabular">{formatNumbers(item.value)}</p>
              </article>
            ))}
          </section>
        ) : null}
      </motion.div>
    </motion.section>
  );
};

export default DashboardSummaryChart;
