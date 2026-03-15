import { motion, Variants } from 'framer-motion';
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
import { capitalizeString } from '@/utils/strings.util';
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
  if (typeof label !== 'string') {
    return '';
  }
  if (label.includes('-W')) {
    return `W${parseInt(label.split('-W')[1], 10)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, month, day] = label.split('-');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
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
  containerVariants,
  itemVariants,
}: DashboardSummaryChartProps) => {
  const metricOptions = getMetricOptionsForRole(role);
  return (
    <motion.section
      aria-label="Summary chart"
      className="mb-6 sm:mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)] sm:p-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav>
            <h2 className="text-base font-semibold text-slate-900">
              Performance Overview
            </h2>
            <p className="text-sm text-slate-500">
              Dynamic summary for quick trend checks.
            </p>
          </nav>
          <ul className="flex flex-wrap items-center gap-2">
            {(['7d', '30d', '90d'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onRangeChange(key)}
                className={`rounded-full border px-3 py-1 text-xs cursor-pointer font-medium transition ${
                  range === key
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
            <Select
              value={metric}
              onValueChange={(value) => onMetricChange(value)}
            >
              <SelectTrigger className="h-8 w-[140px] !text-[13px] cursor-pointer">
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

        <section className="mt-4 h-56 sm:h-64 relative">
          {isLoading && (
            <figure className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-xl">
              <figure className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#5f9598]" />
            </figure>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: -10, right: 10, top: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="summaryGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#5f9598" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#5f9598" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                strokeOpacity={0.6}
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
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                  fontWeight: 500,
                }}
                labelFormatter={formatLabel}
                cursor={{
                  stroke: '#5f9598',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#5f9598"
                strokeWidth={2.5}
                fill="url(#summaryGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#5f9598',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </motion.div>
    </motion.section>
  );
};

export default DashboardSummaryChart;
