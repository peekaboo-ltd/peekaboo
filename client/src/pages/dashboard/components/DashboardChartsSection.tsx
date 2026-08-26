import { motion, type Variants } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import type { DashboardSupportCardData } from '@/types/dashboard.type';
import { formatNumbers } from '@/utils/strings.util';
import DashboardPanel from './DashboardPanel';

interface DashboardChartsSectionProps {
  widgets: DashboardSupportCardData[];
  itemVariants?: Variants;
}

const accentStroke: Record<NonNullable<DashboardSupportCardData['accent']>, string> = {
  blue: 'var(--chart-1)',
  teal: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  emerald: 'var(--chart-4)',
  violet: 'var(--chart-5)',
  rose: 'var(--chart-2)',
  slate: 'var(--chart-3)',
};

const DashboardChartsSection = ({
  widgets,
  itemVariants,
}: DashboardChartsSectionProps) => {
  if (!widgets.length) return null;

  return (
    <section aria-label="Dashboard support widgets" className="grid gap-4">
      {widgets.map((widget) => (
        <motion.div key={widget.title} variants={itemVariants}>
          <DashboardPanel
            eyebrow="Support widget"
            title={widget.title}
            description={widget.subtitle}
            className="rounded-lg p-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[2rem] font-medium leading-none text-[color:var(--ink)]">
                {widget.value}
              </p>
              {widget.chartType !== 'status' && widget.data && widget.data.length > 0 && (
                <div className="h-16 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    {widget.chartType === 'bar' ? (
                      <BarChart data={widget.data}>
                        <Tooltip formatter={(value) => formatNumbers(Number(value))} />
                        <Bar
                          dataKey="value"
                          fill={accentStroke[widget.accent ?? 'blue']}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                      <LineChart data={widget.data}>
                        <Tooltip formatter={(value) => formatNumbers(Number(value))} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={accentStroke[widget.accent ?? 'blue']}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {widget.chartType === 'status' && widget.breakdown ? (
              <div className="mt-5 space-y-3">
                {widget.breakdown.slice(0, 4).map((item) => {
                  const total = widget.breakdown?.reduce((sum, current) => sum + current.value, 0) || 0;
                  const width = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between text-sm text-[--muted]">
                        <span>{item.label}</span>
                        <span className="font-medium text-[--ink]">{formatNumbers(item.value)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface)]">
                        <div
                          className="h-full rounded-full bg-[color:var(--chart-2)]"
                          style={{ width: `${Math.max(width, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[--muted]">
                {widget.subtitle}
              </p>
            )}
          </DashboardPanel>
        </motion.div>
      ))}
    </section>
  );
};

export default DashboardChartsSection;
