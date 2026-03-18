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
      className="overflow-hidden rounded-[32px] border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,248,252,0.96))] p-5 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)] sm:p-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Primary insight
            </p>
            {data.length > 0 ? (
              <p className="mt-2 text-[2.25rem] font-semibold leading-none tracking-[-0.04em] text-slate-950 sm:text-[3rem]">
                {formattedTotal}
              </p>
            ) : (
              <p className="mt-2 text-[2.25rem] font-semibold leading-none tracking-[-0.04em] text-slate-300 sm:text-[3rem]">
                —
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              {capitalizeString(metric.toLowerCase())} across the selected period with a single high-signal trend line.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {range.toUpperCase()} view
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {data.length} data points
              </span>
              {peakPoint && (
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
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
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
                  range === key
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
            <figure className="absolute inset-0 z-10 flex items-center justify-center rounded-[26px] bg-white/60">
              <figure className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#2563eb]" />
            </figure>
          )}
          <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_42%),linear-gradient(180deg,rgba(248,250,252,0.8),rgba(255,255,255,0.6))]" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 20, bottom: 6 }}>
              <defs>
                <linearGradient id="summaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#d9e3ef"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                minTickGap={20}
                tickFormatter={formatLabel}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                labelFormatter={formatLabel}
                cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2.8}
                fill="url(#summaryGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {breakdown.length > 0 && (
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            {breakdown.slice(0, 3).map((item) => (
              <article
                key={item.label}
                className="rounded-[22px] border border-slate-200/80 bg-white/85 px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
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
