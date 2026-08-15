import { useMemo } from 'react';
import { AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import type { OrderLocation } from '@/types/order.type';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import {
  describeLocation,
  hasCoordinates,
  openInGoogleMapsUrl,
} from '@/utils/locations.util';

interface LocationMiniMapProps {
  location?: OrderLocation | null;
  /** Used in the accessible name of the external link, e.g. "Pickup". */
  label: string;
  className?: string;
}

const LocationMiniMap = ({
  location,
  label,
  className = '',
}: LocationMiniMapProps) => {
  const center = useMemo(
    () =>
      hasCoordinates(location)
        ? { lat: Number(location?.latitude), lng: Number(location?.longitude) }
        : null,
    [location]
  );

  const mapsUrl = openInGoogleMapsUrl(location);

  if (!center || !mapsUrl) {
    return null;
  }

  const description = describeLocation(location);
  const canRenderMap = Boolean(ENVIRONMENTS.GOOGLE_MAPS_API_KEY);

  return (
    <figure
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}
    >
      {canRenderMap ? (
        <div className="h-40 w-full">
          <Map
            defaultCenter={center}
            defaultZoom={16}
            mapId={ENVIRONMENTS.GOOGLE_MAPS_MAP_ID}
            gestureHandling="cooperative"
            disableDefaultUI
            zoomControl
            clickableIcons={false}
          >
            <AdvancedMarker position={center} title={description || label}>
              <Pin
                background="var(--color-secondary-500, #ffc400)"
                borderColor="#0a0a0a"
                glyphColor="#0a0a0a"
              />
            </AdvancedMarker>
          </Map>
        </div>
      ) : (
        // Maps key missing — keep the link working rather than hiding the location.
        <div className="flex h-24 w-full items-center justify-center gap-2 bg-slate-50 text-slate-400">
          <FontAwesomeIcon icon={faLocationDot} className="text-sm" aria-hidden="true" />
          <span className="text-xs">Map preview unavailable</span>
        </div>
      )}

      <figcaption className="border-t border-slate-200 px-3 py-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label.toLowerCase()} location in Google Maps (opens in a new tab)`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 transition-colors hover:text-primary"
        >
          Open in Google Maps
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            className="text-[10px]"
            aria-hidden="true"
          />
        </a>
      </figcaption>
    </figure>
  );
};

export default LocationMiniMap;
