import { motion, Variants } from 'framer-motion';
import {
  Line,
  LineChart,
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

interface DashboardSummaryChartProps {
  range: '7d' | '30d' | '90d';
  metric: 'ORDERS' | 'REVENUE' | 'ACTIVE_USERS';
  onRangeChange: (value: '7d' | '30d' | '90d') => void;
  onMetricChange: (value: 'ORDERS' | 'REVENUE' | 'ACTIVE_USERS') => void;
  data: Array<{ name: string; value: number }>;
  containerVariants?: Variants;
  itemVariants?: Variants;
}

const DashboardSummaryChart = ({
  range,
  metric,
  onRangeChange,
  onMetricChange,
  data,
  containerVariants,
  itemVariants,
}: DashboardSummaryChartProps) => {
  return (
    <motion.section
      aria-label="Summary chart"
      className="mb-6 sm:mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)] sm:p-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Performance Overview
            </h2>
            <p className="text-sm text-slate-500">
              Dynamic summary for quick trend checks.
            </p>
          </div>
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
            <Select value={metric} onValueChange={(value) => onMetricChange(value as typeof metric)}>
              <SelectTrigger className="h-8 w-[140px] !text-[12px] cursor-pointer">
                <SelectValue className="!text-[12px]" placeholder="Metric" />
              </SelectTrigger>
              <SelectContent className="!text-[12px]">
                {(['ORDERS', 'REVENUE', 'ACTIVE_USERS'] as const).map((option) => (
                  <SelectItem
                    className="cursor-pointer !text-[12px]"
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

        <div className="mt-4 h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -10, right: 10, top: 8, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default DashboardSummaryChart;
