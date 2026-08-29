import { formatCurrency } from '@/utils/strings.util';
import { cn } from '@/lib/utils';

interface RouteSummaryProps {
  /** Kilometres, or null while the route is still resolving. */
  distance: number | null;
  /** Minutes, or null while the route is still resolving. */
  estimatedTime: number | null;
  fee?: number | null;
  /** "Total to pay" before payment, "Total" once it is settled. */
  feeLabel?: string;
  className?: string;
}

/**
 * Distance, delivery time, and price — the three figures someone actually
 * decides on.
 *
 * They spent a while as 13px labels overlaid on the map, which put the number
 * that decides whether you pay at the smallest size on the page, on top of a
 * moving basemap. Here they are at the metric step in their own framed strip,
 * in the reading column, directly above the button they inform.
 *
 * The delivery-time arithmetic lives here rather than in the pages, because
 * both of them need the same answer and only one of them had it.
 */

/** A quoted window, not a point estimate: base time, and base + 15 as the ceiling. */
const deliveryWindow = (minutes: number) => {
  const base = Math.max(Math.round(minutes), 20);
  const ceiling = Math.max(Math.round(minutes) + 15, 30);

  if (ceiling < 60) {
    return { value: `${base}–${ceiling}`, unit: 'minutes' };
  }

  const asHours = (total: number) =>
    `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

  return base < 60
    ? { value: `${base} min – ${asHours(ceiling)}`, unit: 'hours' }
    : { value: `${asHours(base)} – ${asHours(ceiling)}`, unit: 'hours' };
};

const Figure = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) => (
  <div className="min-w-0 px-4 py-3 first:pl-5 last:pr-5">
    <p className="type-eyebrow">{label}</p>
    <p className="type-metric mt-1 truncate">{value}</p>
    {unit ? <p className="type-meta mt-0.5 truncate">{unit}</p> : null}
  </div>
);

const RouteSummary = ({
  distance,
  estimatedTime,
  fee,
  feeLabel = 'Total to pay',
  className,
}: RouteSummaryProps) => {
  const resolved = distance !== null && estimatedTime !== null;
  const window = resolved ? deliveryWindow(estimatedTime) : null;
  const feeValue = Number(fee ?? 0);

  return (
    <section
      className={cn(
        'card-framed grid grid-cols-3 divide-x divide-(--line) overflow-hidden',
        className,
      )}
      aria-label="Route summary"
    >
      <Figure
        label="Distance"
        value={resolved ? distance.toFixed(1) : '—'}
        unit={resolved ? 'kilometers' : undefined}
      />
      <Figure
        label="Delivery time"
        value={window?.value ?? '—'}
        unit={window?.unit}
      />
      <Figure
        label={feeLabel}
        value={feeValue > 0 ? formatCurrency(feeValue) : '—'}
        unit={feeValue > 0 ? 'including VAT' : undefined}
      />
    </section>
  );
};

export default RouteSummary;
