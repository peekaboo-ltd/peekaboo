import { Card, CardContent } from '@/components/ui/card';
import { type MetricCardData } from '@/types/dashboard.type';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createSearchParams, Link } from 'react-router-dom';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

const accentMap = {
  blue: {
    icon: 'text-slate-700',
    iconBg: 'bg-[var(--peekaboo-surface)]',
    iconRing: 'ring-slate-200',
    spark: 'hsl(var(--primary))',
    footer: 'text-slate-700',
  },
  teal: {
    icon: 'text-slate-700',
    iconBg: 'bg-[var(--peekaboo-surface)]',
    iconRing: 'ring-slate-200',
    spark: '#0891b2',
    footer: 'text-slate-700',
  },
  amber: {
    icon: 'text-amber-600',
    iconBg: 'bg-amber-50',
    iconRing: 'ring-amber-100',
    spark: '#d97706',
    footer: 'text-amber-700',
  },
  emerald: {
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    iconRing: 'ring-emerald-100',
    spark: '#059669',
    footer: 'text-emerald-700',
  },
  violet: {
    icon: 'text-slate-700',
    iconBg: 'bg-[var(--peekaboo-surface)]',
    iconRing: 'ring-slate-200',
    spark: 'hsl(var(--primary))',
    footer: 'text-slate-700',
  },
  rose: {
    icon: 'text-rose-600',
    iconBg: 'bg-rose-50',
    iconRing: 'ring-rose-100',
    spark: '#e11d48',
    footer: 'text-rose-700',
  },
  slate: {
    icon: 'text-slate-700',
    iconBg: 'bg-[var(--peekaboo-surface)]',
    iconRing: 'ring-slate-200',
    spark: '#475569',
    footer: 'text-slate-700',
  },
} as const;

const MetricCard = ({
  label,
  value,
  trend,
  href,
  query,
  to,
  icon,
  sparklineData,
  sparklineType,
  sparkColor,
  accent = 'slate',
  comparisonLabel,
  note,
  footerText,
}: MetricCardData) => {
  const destination =
    to ||
    (href
      ? query
        ? `${href}?${createSearchParams(query).toString()}`
        : href
      : undefined);

  const chartData = sparklineData?.map((item, index) => ({ value: item, index })) || [];

  const renderSparkline = () => {
    if (!sparklineData?.length || !sparklineType) return null;

    return (
      <div className="h-12 w-24">
        <ResponsiveContainer width="100%" height="100%">
          {sparklineType === 'line' ? (
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor || accentMap[accent].spark}
                strokeWidth={2.4}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <Bar
                dataKey="value"
                fill={sparkColor || accentMap[accent].spark}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const cardContent = (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-xl border border-[color:var(--ops-line)] bg-[var(--peekaboo-surface)] shadow-[0_1px_0_rgba(20,24,29,0.05)] transition-all duration-300',
        destination
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-18px_rgba(20,24,29,0.5)]'
          : 'hover:shadow-[0_10px_22px_-18px_rgba(20,24,29,0.5)]',
      )}
    >
      <CardContent className="relative p-5 sm:p-6">
        <header className="mb-4 flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-3">
            {icon && (
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1 transition-transform duration-300 group-hover:scale-[1.03]',
                  accentMap[accent].iconBg,
                  accentMap[accent].iconRing,
                )}
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={cn('text-base sm:text-lg', accentMap[accent].icon)}
                  aria-hidden="true"
                />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-medium uppercase text-slate-600">
                {label}
              </span>
              {(comparisonLabel || note) && (
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {comparisonLabel || note}
                </span>
              )}
            </span>
          </span>
          {trend && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
                }`}
              aria-label={`Trend: ${trend.isPositive ? 'increasing' : 'decreasing'} by ${Math.abs(trend.value)}%`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </header>

        <section className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[2rem] font-medium leading-none text-[color:var(--ops-ink)] sm:text-[2.3rem]"
              aria-label={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
            >
              {value}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm leading-6 text-slate-600">
              {footerText || note || comparisonLabel || 'Performance snapshot'}
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {renderSparkline()}
            {destination && (
              <span
                className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="transform text-sm text-slate-700 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[color:var(--ops-line)] pt-4 sm:hidden">
          <span className={cn('text-xs font-medium', accentMap[accent].footer)}>
            {footerText || comparisonLabel || 'Live dashboard signal'}
          </span>
          {destination && (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-sm text-slate-500"
              aria-hidden="true"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (destination) {
    return (
      <Link to={destination} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default MetricCard;
