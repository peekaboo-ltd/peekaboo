import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DashboardStatusBreakdownItem } from '@/types/dashboard.type';
import { capitalizeString, formatCurrency, formatNumbers } from '@/utils/strings.util';
import { RoleTypes } from '@/types/auth.type';

const chartStroke = 'var(--chart-2)';

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
      className="overflow-hidden rounded-[--radius-card] border border-[--line] bg-[--paper] p-5 sm:p-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase text-[--muted]">
              Primary insight
            </p>
            {data.length > 0 ? (
              <p className="mt-2 text-[2.25rem] font-medium leading-none text-[color:var(--ink)] sm:text-[3rem]">
                {formattedTotal}
              </p>
            ) : (
              <p className="mt-2 text-[2.25rem] font-medium leading-none text-[--muted] sm:text-[3rem]">
                —
              </p>
            )}
            <p className="mt-2 text-sm text-[--muted]">
              {capitalizeString(metric.toLowerCase())} across the selected period with a single high-signal trend line.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[--line] bg-[var(--surface)] px-3 py-1 text-xs font-normal text-[--ink]">
                {range.toUpperCase()} view
              </span>
              <span className="rounded-full border border-[--line] bg-[var(--surface)] px-3 py-1 text-xs font-normal text-[--muted]">
                {data.length} data points
              </span>
              {peakPoint && (
                <span className="rounded-full border border-[--line] bg-[--surface] px-3 py-1 text-xs font-medium text-[--ink]">
                  Peak {formatLabel(peakPoint.name)}
                </span>
              )}
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-2 xl:shrink-0">
            {(['7d', '30d', '90d'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onRangeChange(key)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-normal transition ${
                  range === key
                    ? 'border-[--ink] bg-[--ink] text-[--paper]'
                    : 'border-[--line] text-[--muted] hover:border-[--line]'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
            <Select value={metric} onValueChange={(value) => onMetricChange(value)}>
              <SelectTrigger className="h-8 w-[140px] cursor-pointer !text-[13px]">
                <SelectValue className="!text-[13px]" placeholder="Metric" />
              </SelectTrigger>
              <SelectContent className="!text-[13px]">
                {metricOptions.map((option) => (
                  <SelectItem
                    className="cursor-pointer !text-[13px]"
                    key={option}
                    value={option}
                  >
                    {capitalizeString(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ul>
        </header>

        <section className="relative mt-8 h-64 sm:h-72">
          {isLoading && (
            <figure className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-[var(--surface)]">
              <figure className="h-5 w-5 animate-spin rounded-full border-2 border-[--line] border-t-[--ink]" />
            </figure>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 20, bottom: 6 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--line)"
                strokeOpacity={0.9}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                minTickGap={20}
                tickFormatter={formatLabel}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-control)',
                  boxShadow: 'var(--shadow-popover)',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--ink)', fontWeight: 500 }}
                labelFormatter={formatLabel}
                cursor={{ stroke: chartStroke, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartStroke}
                strokeWidth={2.8}
                fill="transparent"
                dot={false}
                activeDot={{ r: 5, fill: chartStroke, stroke: 'var(--paper)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {breakdown.length > 0 && (
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            {breakdown.slice(0, 3).map((item) => (
              <article
                key={item.label}
                className="rounded-md border border-[color:var(--line)] bg-[var(--surface)] px-4 py-3"
              >
                <p className="text-[11px] font-medium uppercase text-[--muted]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-medium text-[color:var(--ink)]">
                  {formatNumbers(item.value)}
                </p>
              </article>
            ))}
          </section>
        )}
      </motion.div>
    </motion.section>
  );
};

export default DashboardSummaryChart;
