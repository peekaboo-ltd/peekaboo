import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import type { OrderLocation } from '@/types/order.type';
import { useNearestPlace } from '@/hooks/locations/useNearestPlace';

/**
 * The closest recognisable place for a location — what a rider would actually
 * navigate by, shown above the administrative breakdown.
 */
const NearestPlace = ({ location }: { location?: OrderLocation | null }) => {
  const { placeName, address, isLoading } = useNearestPlace(location);

  if (isLoading) {
    return (
      <p className="flex items-center gap-2" aria-live="polite">
        <span className="h-3 w-3 animate-pulse rounded-full bg-[--surface]" />
        <span className="h-3 w-44 animate-pulse rounded-full bg-[--surface]" />
      </p>
    );
  }

  if (!placeName && !address) {
    return null;
  }

  // When there's no named place the address becomes the headline instead of a
  // subtitle, so we never render the same string twice.
  const heading = placeName || address;
  const subtitle = placeName && address && address !== placeName ? address : null;

  return (
    <p className="flex items-start gap-2">
      <FontAwesomeIcon
        icon={faLocationDot}
        className="mt-0.5 text-xs text-[--muted]"
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block break-words text-sm font-medium text-[--ink]">
          {heading}
        </span>
        {subtitle ? (
          <span className="block break-words text-xs text-[--muted]">{subtitle}</span>
        ) : null}
      </span>
    </p>
  );
};

export default NearestPlace;
