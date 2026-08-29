import {
  AdvancedMarker,
  APILoadingStatus,
  Map,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import useMediaQuery from '@/hooks/common/useMediaQuery';
import HeroMapViewport from '@/pages/home/components/HeroMapViewport';
import HeroRouteCard from '@/pages/home/components/HeroRouteCard';
import { DOWNTOWN_KIGALI_HQ, KIGALI_CENTER } from './publicMap.utils';

interface PublicHeadquartersMapProps {
  ridersLabel?: string;
}

const PublicHeadquartersMapContent = ({
  ridersLabel = 'Kigali-wide',
}: PublicHeadquartersMapProps) => {
  const apiStatus = useApiLoadingStatus();

  if (
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <HeroRouteCard
        statusLabel="Downtown Kigali · Headquarters"
        etaLabel={ridersLabel}
      />
    );
  }

  if (apiStatus !== APILoadingStatus.LOADED) {
    return (
      <div
        className="aspect-[4/3] w-full animate-pulse rounded-md bg-(--surface)"
        aria-label="Loading headquarters map"
      />
    );
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
        <HeroMapViewport positions={[DOWNTOWN_KIGALI_HQ]} emptyZoom={14} />

        <AdvancedMarker
          position={DOWNTOWN_KIGALI_HQ}
          title="Peekaboo headquarters — Downtown Kigali"
        >
          <Pin
            background="var(--public-clay-soft)"
            borderColor="var(--public-clay)"
            glyphColor="var(--public-clay)"
          />
        </AdvancedMarker>
      </Map>

      <figcaption className="absolute left-3 top-3 z-10 rounded-(--radius-control) bg-(--paper) px-3 py-2 text-xs text-(--ink)">
        Downtown Kigali · Headquarters
      </figcaption>

      <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-2 shrink-0 rounded-full bg-(--public-clay)"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-(--ink)">
            Serving Kigali daily
          </span>
        </span>
        <span className="shrink-0 text-sm text-(--muted) tabular-nums">
          {ridersLabel}
        </span>
      </figcaption>
    </figure>
  );
};

const PublicHeadquartersMap = ({ ridersLabel }: PublicHeadquartersMapProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!isDesktop) return null;
  if (!ENVIRONMENTS.GOOGLE_MAPS_API_KEY) {
    return (
      <HeroRouteCard
        statusLabel="Downtown Kigali · Headquarters"
        etaLabel={ridersLabel ?? 'Kigali-wide'}
      />
    );
  }

  return <PublicHeadquartersMapContent ridersLabel={ridersLabel} />;
};

export default PublicHeadquartersMap;
