import {
  AdvancedMarker,
  APILoadingStatus,
  Map,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import useApproximateLocation from '@/hooks/locations/useApproximateLocation';
import useMediaQuery from '@/hooks/common/useMediaQuery';
import HeroMapViewport from '@/pages/home/components/HeroMapViewport';
import HeroRouteCard from '@/pages/home/components/HeroRouteCard';
import MapAccuracyCircle from './MapAccuracyCircle';
import {
  getApproximateZoom,
  KIGALI_CENTER,
} from './publicMap.utils';

interface PublicApproximateMapProps {
  statusLabel?: string;
  etaLabel?: string;
}

const PublicApproximateMapContent = ({
  statusLabel = 'Tracking coverage',
  etaLabel = 'Kigali-wide',
}: PublicApproximateMapProps) => {
  const apiStatus = useApiLoadingStatus();
  const approximateLocation = useApproximateLocation(
    Boolean(ENVIRONMENTS.GOOGLE_MAPS_API_KEY),
  );

  if (
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return <HeroRouteCard statusLabel={statusLabel} etaLabel={etaLabel} />;
  }

  if (apiStatus !== APILoadingStatus.LOADED) {
    return (
      <div
        className="aspect-[4/3] w-full animate-pulse rounded-md bg-(--surface)"
        aria-label="Loading map"
      />
    );
  }

  const center = approximateLocation?.position ?? KIGALI_CENTER;
  const accuracyMeters = approximateLocation?.accuracyKm
    ? approximateLocation.accuracyKm * 1000
    : 2800;

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
        <HeroMapViewport
          positions={[center]}
          emptyCenter={center}
          emptyZoom={getApproximateZoom(approximateLocation?.accuracyKm ?? null)}
        />

        <MapAccuracyCircle
          center={center}
          radiusMeters={accuracyMeters}
          fillColor="var(--public-sky)"
          strokeColor="var(--public-sky)"
        />

        <AdvancedMarker position={center} title="Approximate area">
          <Pin
            background="var(--public-sky-soft)"
            borderColor="var(--public-sky)"
            glyphColor="var(--public-sky)"
          />
        </AdvancedMarker>
      </Map>

      <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-2 shrink-0 rounded-full bg-(--public-sky)"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-(--ink)">
            {approximateLocation
              ? `Approximate area · ${approximateLocation.label}`
              : statusLabel}
          </span>
        </span>
        <span className="shrink-0 text-sm text-(--muted) tabular-nums">
          {etaLabel}
        </span>
      </figcaption>
    </figure>
  );
};

const PublicApproximateMap = (props: PublicApproximateMapProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!isDesktop) return null;
  if (!ENVIRONMENTS.GOOGLE_MAPS_API_KEY) {
    return <HeroRouteCard statusLabel={props.statusLabel} etaLabel={props.etaLabel} />;
  }

  return <PublicApproximateMapContent {...props} />;
};

export default PublicApproximateMap;
