import { useMemo } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  Map,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
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

  const etaLabel = formatEta(estimatedTime) ?? (distance !== null ? `${distance.toFixed(1)} km` : '12 min away');

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
        className="aspect-[4/3] w-full animate-pulse rounded-md bg-(--surface)"
        aria-label="Loading route map"
      />
    );
  }

  if (!positions.length) {
    return <HeroRouteCard etaLabel={etaLabel} statusLabel="Set your route" />;
  }

  return (
    <figure className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-md bg-(--surface)">
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

      <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="size-2 shrink-0 rounded-full bg-(--ink)" aria-hidden="true" />
          <span className="truncate text-sm font-normal text-(--ink)">{statusLabel}</span>
        </span>
        <span className="shrink-0 text-sm text-(--muted) tabular-nums">{etaLabel}</span>
      </figcaption>
    </figure>
  );
};

export default OrderSetupHeroMap;
