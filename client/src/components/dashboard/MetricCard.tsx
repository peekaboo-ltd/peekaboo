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
    icon: 'text-(--ink)',
    iconBg: 'bg-[var(--surface)]',
    iconRing: 'ring-(--line)',
    spark: 'var(--chart-1)',
    footer: 'text-(--ink)',
  },
  teal: {
    icon: 'text-(--ink)',
    iconBg: 'bg-[var(--surface)]',
    iconRing: 'ring-(--line)',
    spark: 'var(--chart-2)',
    footer: 'text-(--ink)',
  },
  amber: {
    icon: 'text-(--ink)',
    iconBg: 'bg-(--surface)',
    iconRing: 'ring-(--ink)',
    spark: 'var(--chart-3)',
    footer: 'text-(--ink)',
  },
  emerald: {
    icon: 'text-(--ink)',
    iconBg: 'bg-(--surface)',
    iconRing: 'ring-(--ink)',
    spark: 'var(--chart-4)',
    footer: 'text-(--ink)',
  },
  violet: {
    icon: 'text-(--ink)',
    iconBg: 'bg-[var(--surface)]',
    iconRing: 'ring-(--line)',
    spark: 'var(--chart-5)',
    footer: 'text-(--ink)',
  },
  rose: {
    icon: 'text-(--ink)',
    iconBg: 'bg-(--surface)',
    iconRing: 'ring-(--ink)',
    spark: 'var(--chart-2)',
    footer: 'text-(--ink)',
  },
  slate: {
    icon: 'text-(--ink)',
    iconBg: 'bg-[var(--surface)]',
    iconRing: 'ring-(--line)',
    spark: 'var(--chart-3)',
    footer: 'text-(--ink)',
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
        'group relative overflow-hidden rounded-(--radius-card) border border-(--line) bg-(--paper) transition-[border-color,background-color,box-shadow] duration-200 ease-[var(--ease-flat)]',
        destination
          ? 'cursor-pointer hover:border-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]'
          : '',
      )}
    >
      <CardContent className="relative p-5 sm:p-6">
        <header className="mb-4 flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-3">
            {icon && (
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-(--radius-control) ring-1',
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
              <span className="block truncate text-[11px] font-medium text-(--muted)">
                {label}
              </span>
              {(comparisonLabel || note) && (
                <span className="mt-0.5 block truncate text-xs text-(--muted)">
                  {comparisonLabel || note}
                </span>
              )}
            </span>
          </span>
          {trend && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${trend.isPositive
                  ? 'bg-(--surface) text-(--ink)'
                  : 'bg-(--surface) text-(--ink)'
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
              className="truncate text-[2rem] font-medium leading-none text-[color:var(--ink)] sm:text-[2.3rem]"
              aria-label={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
            >
              {value}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm leading-6 text-(--muted)">
              {footerText || note || comparisonLabel || 'Performance snapshot'}
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {renderSparkline()}
            {destination && (
              <span
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-sm text-(--ink) transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[color:var(--line)] pt-4 sm:hidden">
          <span className={cn('text-xs font-medium', accentMap[accent].footer)}>
            {footerText || comparisonLabel || 'Live dashboard signal'}
          </span>
          {destination && (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-sm text-(--muted)"
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
