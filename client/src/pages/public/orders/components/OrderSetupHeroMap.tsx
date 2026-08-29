import { useMemo } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  Map,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import type { OrderLocation } from '@/types/order.type';
import { hasCoordinates } from '@/utils/locations.util';
import HeroMapViewport from '@/pages/home/components/HeroMapViewport';
import HeroRouteCard from '@/pages/home/components/HeroRouteCard';

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
): google.maps.LatLngLiteral | null =>
  hasCoordinates(location)
    ? {
        lat: Number(location?.latitude),
        lng: Number(location?.longitude),
      }
    : null;

const formatEta = (minutes: number | null) => {
  if (minutes === null) return null;
  const base = Math.round(minutes);
  const buffered = base + 15;
  const low = base < 20 ? 20 : base;
  const high = buffered < 30 ? 30 : buffered;
  return high < 60 ? `${low}–${high} min` : `${low} min+`;
};

const OrderSetupHeroMap = ({
  pickup,
  dropoff,
  distance,
  estimatedTime,
  className,
}: OrderSetupHeroMapProps) => {
  const apiStatus = useApiLoadingStatus();
  const origin = toPosition(pickup);
  const destination = toPosition(dropoff);
  const positions = useMemo(
    () => [origin, destination].filter(
      (position): position is google.maps.LatLngLiteral => position !== null,
    ),
    [origin, destination],
  );

  const statusLabel = (() => {
    if (origin && destination) return 'Route ready';
    if (origin) return 'Pickup set';
    if (destination) return 'Drop-off set';
    return 'Rider on the way';
  })();

  const etaLabel =
    formatEta(estimatedTime ?? null) ??
    (typeof distance === 'number' ? `${distance.toFixed(1)} km` : '12 min away');

  if (!ENVIRONMENTS.GOOGLE_MAPS_API_KEY) {
    return <HeroRouteCard etaLabel={etaLabel} statusLabel={statusLabel} />;
  }

  if (
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return <HeroRouteCard etaLabel={etaLabel} statusLabel={statusLabel} />;
  }

  if (apiStatus !== APILoadingStatus.LOADED) {
    return (
      <div
        className={cn(
          'aspect-[4/3] w-full animate-pulse rounded-(--radius-card) bg-(--surface)',
          className,
        )}
        aria-label="Loading route map"
      />
    );
  }

  if (!positions.length) {
    return <HeroRouteCard etaLabel={etaLabel} statusLabel="Set your route" />;
  }

  return (
    <figure
      className={cn(
        'relative isolate aspect-[4/3] w-full overflow-hidden rounded-(--radius-card) bg-(--surface)',
        className,
      )}
    >
      <Map
        defaultCenter={KIGALI_CENTER}
        defaultZoom={12}
        mapId={ENVIRONMENTS.GOOGLE_MAPS_MAP_ID}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        reuseMaps
      >
        <HeroMapViewport positions={positions} />

        {origin ? (
          <AdvancedMarker position={origin} title="Pickup">
            <Pin
              background="var(--paper)"
              borderColor="var(--ink)"
              glyphColor="var(--ink)"
            />
          </AdvancedMarker>
        ) : null}

        {destination ? (
          <AdvancedMarker position={destination} title="Drop-off">
            <Pin
              background="var(--ink)"
              borderColor="var(--ink)"
              glyphColor="var(--paper)"
            />
          </AdvancedMarker>
        ) : null}
      </Map>

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
