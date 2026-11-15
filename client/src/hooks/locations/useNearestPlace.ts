import { useEffect, useState } from 'react';
import type { OrderLocation } from '@/types/order.type';
import { calculateHaversineDistance, hasCoordinates } from '@/utils/locations.util';
import { reverseLookup } from '@/utils/mapboxSearch.util';
import { useI18n, type Language } from '@/i18n/i18n';

export interface NearestPlace {
  /** Name of the closest point of interest, e.g. "Kacyiru Police Station". */
  placeName: string | null;
  /** Street-level address, e.g. "KG 7 Ave, Kigali". */
  address: string | null;
}

const EMPTY_PLACE: NearestPlace = { placeName: null, address: null };

/**
 * A point of interest further away than this describes a different place, so we
 * fall back to the street address instead of naming it.
 */
const MAX_POI_DISTANCE_METRES = 200;

// Mapbox bills each reverse lookup, so results are memoised for the lifetime of
// the tab. Coordinates are rounded to ~1m to keep the key stable across
// re-renders.
const cache = new Map<string, Promise<NearestPlace>>();

const cacheKey = (latitude: number, longitude: number, language: Language) =>
  `${latitude.toFixed(5)},${longitude.toFixed(5)},${language}`;

interface Position {
  lat: number;
  lng: number;
}

const findNearestPoi = async (
  position: Position,
  language: Language
): Promise<string | null> => {
  const [nearest] = await reverseLookup({
    latitude: position.lat,
    longitude: position.lng,
    types: 'poi',
    language,
  });
  if (!nearest?.name) return null;

  const distanceMetres =
    calculateHaversineDistance(
      { latitude: position.lat, longitude: position.lng },
      { latitude: nearest.latitude, longitude: nearest.longitude }
    ) * 1000;

  return distanceMetres <= MAX_POI_DISTANCE_METRES ? nearest.name : null;
};

const findAddress = async (
  position: Position,
  language: Language
): Promise<string | null> => {
  const [nearest] = await reverseLookup({
    latitude: position.lat,
    longitude: position.lng,
    types: 'address,street,neighborhood,locality,place',
    language,
  });
  if (!nearest) return null;
  return (
    nearest.fullAddress ||
    [nearest.name, nearest.placeFormatted].filter(Boolean).join(', ') ||
    null
  );
};

const lookupNearestPlace = async (
  position: Position,
  language: Language
): Promise<NearestPlace> => {
  const [placeName, address] = await Promise.all([
    findNearestPoi(position, language).catch(() => null),
    findAddress(position, language).catch(() => null),
  ]);
  return { placeName, address };
};

/**
 * Resolves a human friendly description of a location.
 *
 * Locations picked through the place search already carry their name and
 * address, so those are returned as-is with no network call. Only locations
 * saved as raw coordinates — a dropped pin, a WhatsApp order, "use my current
 * location" — are looked up against Mapbox.
 */
export const useNearestPlace = (
  location?: OrderLocation | null
): NearestPlace & { isLoading: boolean } => {
  const { language } = useI18n();
  const persistedName = location?.name?.trim() || null;
  const persistedAddress = location?.formattedAddress?.trim() || null;
  const isPersisted = Boolean(persistedName || persistedAddress);

  const latitude = location?.latitude ?? null;
  const longitude = location?.longitude ?? null;

  const [resolved, setResolved] = useState<NearestPlace>(EMPTY_PLACE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isPersisted || !hasCoordinates({ latitude, longitude })) {
      setResolved(EMPTY_PLACE);
      setIsLoading(false);
      return;
    }

    const position = { lat: Number(latitude), lng: Number(longitude) };
    const key = cacheKey(position.lat, position.lng, language);

    let cached = cache.get(key);
    if (!cached) {
      cached = lookupNearestPlace(position, language);
      cache.set(key, cached);
    }

    let active = true;
    setIsLoading(true);

    cached
      .then((place) => {
        if (active) setResolved(place);
      })
      .catch(() => {
        // A failed lookup just means no label — the coordinates still render.
        cache.delete(key);
        if (active) setResolved(EMPTY_PLACE);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isPersisted, language, latitude, longitude]);

  if (isPersisted) {
    return {
      placeName: persistedName,
      address: persistedAddress,
      isLoading: false,
    };
  }

  return { ...resolved, isLoading };
};

export default useNearestPlace;
