import { Card } from '@/components/ui/card';
import { type MetricCardData } from '@/types/dashboard.type';
import { cn } from '@/lib/utils';
import Sparkline from '@/components/charts/Sparkline';
import type { ChartSeriesIndex } from '@/components/charts/chart.tokens';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createSearchParams, Link } from 'react-router-dom';
import { faArrowRight, faArrowTrendDown, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

// `accent` survives from the pre-monochrome palette. Every card now shares one
// treatment; the accent only picks a step on the neutral chart ramp so a row of
// sparklines stays distinguishable from one another.
// `accent` is a leftover name from the old palette. It now selects a step on
// the shared series ramp so a column of metric cards stays tellable apart.
const accentSeries = {
  blue: 1,
  teal: 2,
  amber: 3,
  emerald: 4,
  violet: 5,
  rose: 2,
  slate: 3,
} as const satisfies Record<string, ChartSeriesIndex>;

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
  const { t } = useI18n();
  const destination =
    to ||
    (href
      ? query
        ? `${href}?${createSearchParams(query).toString()}`
        : href
      : undefined);

  const caption = footerText || note || comparisonLabel;

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
            className={cn(
              'type-meta inline-flex shrink-0 items-center gap-1 tabular',
              trend.isPositive ? 'text-(--approve)' : 'text-(--danger)'
            )}
            aria-label={t(trend.isPositive ? 'common.upPercent' : 'common.downPercent', { value: Math.abs(trend.value) })}
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
          aria-label={t('common.valueLabel', { label, value: typeof value === 'number' ? value.toLocaleString() : value })}
        >
          {value}
        </p>
        {sparklineData && sparklineData.length > 0 && (
          <div className="hidden shrink-0 sm:block">
            <Sparkline
              values={sparklineData}
              kind={sparklineType === 'bar' ? 'bar' : 'line'}
              series={accentSeries[accent]}
              ariaLabel={t('common.trendLabel', { label })}
            />
          </div>
        )}
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
