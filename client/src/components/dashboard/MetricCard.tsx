import { Card } from '@/components/ui/card';
import { type MetricCardData } from '@/types/dashboard.type';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createSearchParams, Link } from 'react-router-dom';
import { faArrowRight, faArrowTrendDown, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

// `accent` survives from the pre-monochrome palette. Every card now shares one
// treatment; the accent only picks a step on the neutral chart ramp so a row of
// sparklines stays distinguishable from one another.
const sparkRamp = {
  blue: 'var(--chart-1)',
  teal: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  emerald: 'var(--chart-4)',
  violet: 'var(--chart-5)',
  rose: 'var(--chart-2)',
  slate: 'var(--chart-3)',
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
  const caption = footerText || note || comparisonLabel;

  const renderSparkline = () => {
    if (!sparklineData?.length || !sparklineType) return null;

    return (
      <div className="h-10 w-20" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          {sparklineType === 'line' ? (
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor || sparkRamp[accent]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <Bar
                dataKey="value"
                fill={sparkColor || sparkRamp[accent]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const cardContent = (
    <Card
      interactive={Boolean(destination)}
      className={cn(
        'group h-full gap-3',
        destination && 'active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5">
          {icon && (
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) bg-(--surface) text-(--ink)"
              aria-hidden="true"
            >
              <FontAwesomeIcon icon={icon} className="text-sm" aria-hidden="true" />
            </span>
          )}
          <span className="type-body-sm min-w-0 truncate text-(--muted)">{label}</span>
        </span>

        {trend && (
          // Direction reads from the arrow and the label, not from a fill.
          <span
            className="type-meta inline-flex shrink-0 items-center gap-1 text-(--ink) tabular"
            aria-label={`${trend.isPositive ? 'Up' : 'Down'} ${Math.abs(trend.value)} percent`}
          >
            <FontAwesomeIcon
              icon={trend.isPositive ? faArrowTrendUp : faArrowTrendDown}
              className="size-3"
              aria-hidden="true"
            />
            {Math.abs(trend.value)}%
          </span>
        )}
      </header>

      <div className="flex items-end justify-between gap-4">
        <p
          className="type-metric truncate"
          aria-label={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
        >
          {value}
        </p>
        <div className="hidden items-center gap-2 sm:flex">{renderSparkline()}</div>
      </div>

      {(caption || destination) && (
        <footer className="flex items-center justify-between gap-3">
          <span className="type-meta min-w-0 truncate">{caption}</span>
          {destination && (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="size-3 shrink-0 text-(--muted) transition-transform duration-200 ease-(--ease-glide) group-hover:translate-x-1 group-hover:text-(--ink)"
              aria-hidden="true"
            />
          )}
        </footer>
      )}
    </Card>
  );

  if (destination) {
    return (
      <Link to={destination} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default MetricCard;
