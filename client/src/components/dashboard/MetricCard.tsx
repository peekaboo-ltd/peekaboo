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
    iconBg: 'bg-slate-50',
    iconRing: 'ring-slate-200',
    spark: 'hsl(var(--primary))',
    glow: 'from-slate-50 via-white to-white',
    footer: 'text-slate-700',
  },
  teal: {
    icon: 'text-slate-700',
    iconBg: 'bg-slate-50',
    iconRing: 'ring-slate-200',
    spark: '#0891b2',
    glow: 'from-slate-50 via-white to-white',
    footer: 'text-slate-700',
  },
  amber: {
    icon: 'text-amber-600',
    iconBg: 'bg-amber-50',
    iconRing: 'ring-amber-100',
    spark: '#d97706',
    glow: 'from-amber-50 via-white to-white',
    footer: 'text-amber-700',
  },
  emerald: {
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    iconRing: 'ring-emerald-100',
    spark: '#059669',
    glow: 'from-emerald-50 via-white to-white',
    footer: 'text-emerald-700',
  },
  violet: {
    icon: 'text-slate-700',
    iconBg: 'bg-slate-50',
    iconRing: 'ring-slate-200',
    spark: 'hsl(var(--primary))',
    glow: 'from-slate-50 via-white to-white',
    footer: 'text-slate-700',
  },
  rose: {
    icon: 'text-rose-600',
    iconBg: 'bg-rose-50',
    iconRing: 'ring-rose-100',
    spark: '#e11d48',
    glow: 'from-rose-50 via-white to-white',
    footer: 'text-rose-700',
  },
  slate: {
    icon: 'text-slate-700',
    iconBg: 'bg-slate-100',
    iconRing: 'ring-slate-200',
    spark: '#475569',
    glow: 'from-slate-100 via-white to-white',
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
                stroke={accentMap[accent].spark}
                strokeWidth={2.4}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <Bar dataKey="value" fill={accentMap[accent].spark} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const cardContent = (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300',
        destination
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
          : 'hover:shadow-md',
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
              <span className="block truncate text-sm font-normal text-slate-600">
                {label}
              </span>
              {(comparisonLabel || note) && (
                <span className="mt-0.5 block truncate text-[11px] font-normal uppercase tracking-[0.05em] text-slate-500">
                  {comparisonLabel || note}
                </span>
              )}
            </span>
          </span>
          {trend && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-normal ${trend.isPositive
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
              className="truncate text-[2rem] font-bold leading-none tracking-[-0.03em] text-slate-950 sm:text-[2.3rem]"
              aria-label={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
            >
              {value}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm leading-6 text-slate-500">
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

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 sm:hidden">
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
