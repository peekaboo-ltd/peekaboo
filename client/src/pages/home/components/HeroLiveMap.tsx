import { useMemo } from 'react';
import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  AdvancedMarker,
  APILoadingStatus,
  Map,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { Bike, LocateFixed } from 'lucide-react';
import { useGetSuggestedRiderQuery } from '@/api/queries/landing.queries';
import { FieldMessage } from '@/components/inputs/Field';
import { Button } from '@/components/ui/button';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import type { GeolocationPickupState } from '@/hooks/locations/useGeolocationPickup';
import useDebounce from '@/hooks/common/debounce.hooks';
import useMediaQuery from '@/hooks/common/useMediaQuery';
import type { OrderLocation } from '@/types/order.type';
import { hasCoordinates } from '@/utils/locations.util';
import type { HomeFormValues } from '../home.types';
import HeroMapViewport from './HeroMapViewport';
import HeroRouteCard from './HeroRouteCard';

interface HeroLiveMapProps {
  control: Control<HomeFormValues>;
  geolocation: GeolocationPickupState;
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

const MapLegendItem = ({
  label,
  shape,
}: {
  label: string;
  shape: 'hollow' | 'solid' | 'rider';
}) => (
  <li className="flex items-center gap-2 text-xs text-(--ink)">
    <span
      className={
        shape === 'rider'
          ? 'size-2.5 rounded-full bg-(--ink)'
          : shape === 'solid'
            ? 'size-2.5 rotate-45 rounded-[2px] bg-(--ink)'
            : 'size-2.5 rotate-45 rounded-[2px] border border-(--ink) bg-(--paper)'
      }
      aria-hidden="true"
    />
    {label}
  </li>
);

const HeroLiveMapContent = ({ control, geolocation }: HeroLiveMapProps) => {
  const apiStatus = useApiLoadingStatus();
  const locationFrom = useWatch({ control, name: 'locationFrom' });
  const locationTo = useWatch({ control, name: 'locationTo' });
  const { pickupSource, locationError, isLocating, useMyLocation } = geolocation;

  const origin = toPosition(locationFrom);
  const dropOff = toPosition(locationTo);
  const anchor = origin ?? dropOff;
  const anchorKey = anchor
    ? `${anchor.lat.toFixed(3)},${anchor.lng.toFixed(3)}`
    : '';
  const debouncedAnchorKey = useDebounce(anchorKey, 500);
  const riderQueryArg = useMemo(() => {
    if (!anchor || !debouncedAnchorKey) return skipToken;
    const [latitude, longitude] = debouncedAnchorKey.split(',').map(Number);
    return { latitude, longitude };
  }, [anchor, debouncedAnchorKey]);
  const { data: rider } = useGetSuggestedRiderQuery(riderQueryArg, {
    // Decorative marketing data refreshes on a later mount, never by polling an idle tab.
    refetchOnMountOrArgChange: 60,
  });

  if (!ENVIRONMENTS.GOOGLE_MAPS_API_KEY) return <HeroRouteCard />;
  if (
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return <HeroRouteCard />;
  }
  if (apiStatus !== APILoadingStatus.LOADED) {
    return (
      <div
        className="aspect-[4/3] w-full animate-pulse rounded-md bg-(--surface)"
        aria-label="Loading delivery map"
      />
    );
  }

  const riderPosition = rider
    ? { lat: rider.latitude, lng: rider.longitude }
    : null;
  const positions = [origin, dropOff, riderPosition].filter(
    (position): position is google.maps.LatLngLiteral => position !== null,
  );
  const originLabel =
    pickupSource === 'geolocation' ? 'Your location' : 'Pickup';

  return (
    <div>
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
            <AdvancedMarker position={origin} title={originLabel}>
              <Pin
                background="var(--paper)"
                borderColor="var(--ink)"
                glyphColor="var(--ink)"
              />
            </AdvancedMarker>
          ) : null}

          {dropOff ? (
            <AdvancedMarker position={dropOff} title="Drop-off">
              <Pin
                background="var(--ink)"
                borderColor="var(--ink)"
                glyphColor="var(--paper)"
              />
            </AdvancedMarker>
          ) : null}

          {rider && riderPosition ? (
            <AdvancedMarker
              position={riderPosition}
              title={`${rider.isLive ? 'Live' : 'Latest'} rider position, ${rider.etaMinutes} minutes away`}
            >
              <span className="relative flex size-9 items-center justify-center rounded-full bg-(--ink) text-(--paper)">
                {rider.isLive ? (
                  <span
                    className="absolute inset-0 animate-ping rounded-full border border-(--ink)"
                    aria-hidden="true"
                  />
                ) : null}
                <Bike className="relative size-4" aria-hidden="true" />
              </span>
            </AdvancedMarker>
          ) : null}
        </Map>

        {positions.length ? (
          <figcaption className="absolute left-3 top-3 z-10 rounded-(--radius-control) bg-(--paper) px-3 py-2">
            <ul className="grid gap-1.5">
              {origin ? (
                <MapLegendItem label={originLabel} shape="hollow" />
              ) : null}
              {dropOff ? (
                <MapLegendItem label="Drop-off" shape="solid" />
              ) : null}
              {rider ? (
                <MapLegendItem
                  label={`${rider.isLive ? 'Live rider' : 'Nearby rider'} · ${rider.etaMinutes} min`}
                  shape="rider"
                />
              ) : null}
            </ul>
          </figcaption>
        ) : null}

        {!locationFrom && pickupSource !== 'geolocation' ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-3 left-3 z-10 bg-(--paper)"
            onClick={useMyLocation}
            disabled={isLocating}
          >
            <LocateFixed aria-hidden="true" />
            {isLocating ? 'Finding you…' : 'Use my location'}
          </Button>
        ) : null}
      </figure>

      <FieldMessage errorMessage={locationError ?? undefined} />
    </div>
  );
};

const HeroLiveMap = (props: HeroLiveMapProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  if (!isDesktop) return null;
  return <HeroLiveMapContent {...props} />;
};

export default HeroLiveMap;
