import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import type { OrderLocation } from '@/types/order.type';
import { BaseMap, MapPin } from '@/components/maps/mapGl';
import {
  describeLocation,
  hasCoordinates,
  openInGoogleMapsUrl,
} from '@/utils/locations.util';
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
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

  return (
    <figure
      className={`overflow-hidden rounded-lg border border-(--line) bg-(--paper) ${className}`}
    >
      <div className="h-40 w-full">
        <BaseMap initialCenter={center} initialZoom={16} cooperativeGestures>
          <MapPin
            position={center}
            title={description || label}
            background="var(--ink)"
            borderColor="var(--paper)"
            glyphColor="var(--paper)"
          />
        </BaseMap>
      </div>

      <figcaption className="border-t border-(--line) px-3 py-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('common.openMapLabel', { label: label.toLowerCase() })}
          className="inline-flex items-center gap-1.5 text-xs text-(--muted) transition-colors hover:text-(--ink)"
        >
          {t('common.openMap')}
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            className="text-xs"
            aria-hidden="true"
          />
        </a>
      </figcaption>
    </figure>
  );
};

export default LocationMiniMap;
