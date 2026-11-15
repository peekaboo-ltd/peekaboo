import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BaseMap, MapPin, type LatLng } from '@/components/maps/mapGl';
import type { OrderLocation } from '@/types/order.type';
import { hasCoordinates } from '@/utils/locations.util';
import HeroMapViewport from '@/pages/home/components/HeroMapViewport';
import HeroRouteCard from '@/pages/home/components/HeroRouteCard';
import { useI18n, type I18nContextValue } from '@/i18n/i18n';

interface OrderSetupHeroMapProps {
  pickup?: OrderLocation | null;
  dropoff?: OrderLocation | null;
  distance?: number | null;
  estimatedTime?: number | null;
  /**
   * Sizing escape. The 4/3 default is right when the map sits in a column and
   * gets to pick its own height; a viewport-locked page needs it to fill the
   * cell it is given instead. Pass `h-full` to hand sizing to the grid.
   */
  className?: string;
}

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };

const toPosition = (
  location?: OrderLocation | null,
): LatLng | null =>
  hasCoordinates(location)
    ? {
        lat: Number(location?.latitude),
        lng: Number(location?.longitude),
      }
    : null;

const formatEta = (minutes: number | null, t: I18nContextValue['t']) => {
  if (minutes === null) return null;
  const base = Math.round(minutes);
  const buffered = base + 15;
  const low = base < 20 ? 20 : base;
  const high = buffered < 30 ? 30 : buffered;
  return high < 60
    ? t('publicOrder.map.minutes', { minutes: `${low}–${high}` })
    : t('publicOrder.map.minutesPlus', { minutes: low });
};

const OrderSetupHeroMap = ({
  pickup,
  dropoff,
  distance,
  estimatedTime,
  className,
}: OrderSetupHeroMapProps) => {
  const { t } = useI18n();
  const origin = toPosition(pickup);
  const destination = toPosition(dropoff);
  const positions = useMemo(
    () => [origin, destination].filter(
      (position): position is LatLng => position !== null,
    ),
    [origin, destination],
  );

  const statusLabel = (() => {
    if (origin && destination) return t('publicOrder.map.routeReady');
    if (origin) return t('publicOrder.map.pickupSet');
    if (destination) return t('publicOrder.map.dropoffSet');
    return t('publicOrder.map.riderOnWay');
  })();

  const etaLabel =
    formatEta(estimatedTime ?? null, t) ??
    (typeof distance === 'number'
      ? `${distance.toFixed(1)} km`
      : t('publicOrder.map.minutes', { minutes: 12 }));

  if (!positions.length) {
    return <HeroRouteCard etaLabel={etaLabel} statusLabel={t('publicOrder.map.setRoute')} />;
  }

  return (
    <figure
      className={cn(
        'relative isolate aspect-[4/3] w-full overflow-hidden rounded-(--radius-card) bg-(--surface)',
        className,
      )}
    >
      <BaseMap initialCenter={KIGALI_CENTER} initialZoom={12} cooperativeGestures reuseMaps>
        <HeroMapViewport positions={positions} />

        {origin ? (
          <MapPin
            position={origin}
            title={t('publicOrder.pickup')}
            background="var(--paper)"
            borderColor="var(--ink)"
            glyphColor="var(--ink)"
          />
        ) : null}

        {destination ? (
          <MapPin
            position={destination}
            title={t('publicOrder.destination')}
            background="var(--ink)"
            borderColor="var(--ink)"
            glyphColor="var(--paper)"
          />
        ) : null}
      </BaseMap>

      {/* Status only. The distance and ETA now live in RouteSummary, in the
          reading column — restating them here produced two different numbers
          for the same journey whenever this map was rendered without a route
          and fell back to its placeholder. */}
      <figcaption className="absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-(--radius-control) bg-(--paper) px-4 py-3">
        <span className="size-2 shrink-0 rounded-full bg-(--ink)" aria-hidden="true" />
        <span className="truncate text-sm text-(--ink)">{statusLabel}</span>
      </figcaption>
    </figure>
  );
};

export default OrderSetupHeroMap;
