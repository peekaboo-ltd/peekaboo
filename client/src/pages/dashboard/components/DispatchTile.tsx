import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/i18n';
import type { DispatchStripItem } from './DashboardDispatchStrip';

/**
 * One live operational reading. Status is carried by hue AND by the dot's
 * shape — a filled circle, a hollow ring, a rotated square — so the three
 * states survive greyscale and colour-blindness.
 */
// Rotating a `rounded-full` dot leaves a circle, so the three states have to
// differ in the radius too: filled circle, hollow ring, filled diamond.
const toneByStatus: Record<DispatchStripItem['status'], string> = {
  up: 'rounded-full bg-(--approve)',
  watch: 'rounded-full border-2 border-(--warning) bg-transparent',
  down: 'rounded-none rotate-45 bg-(--danger)',
};

const DispatchTile = ({ item }: { item: DispatchStripItem }) => {
  const { t } = useI18n();
  const labelByStatus: Record<DispatchStripItem['status'], string> = {
    up: t('dashboard.dispatch.healthy'),
    watch: t('dashboard.dispatch.watch'),
    down: t('dashboard.dispatch.degraded'),
  };

  return (
  <li className="card-quiet px-3 py-2.5">
    <div className="flex items-center gap-2">
      <span
        className={cn('size-2.5 shrink-0', toneByStatus[item.status])}
        aria-hidden="true"
      />
      <p className="type-meta min-w-0 truncate">{item.label}</p>
      <span className="sr-only">{labelByStatus[item.status]}</span>
    </div>
    <p className="mt-1 truncate text-lg font-medium tabular">{item.value}</p>
  </li>
  );
};

export default DispatchTile;
