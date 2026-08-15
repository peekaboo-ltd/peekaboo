import { useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { OrderLocation } from '@/types/order.type';
import { calculateHaversineDistance, hasCoordinates } from '@/utils/locations.util';

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

// Both the Places and Geocoding APIs bill per call, so results are memoised for
// the lifetime of the tab. Coordinates are rounded to ~1m to keep the key stable
// across re-renders.
const cache = new Map<string, Promise<NearestPlace>>();

const cacheKey = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

const findNearestPoi = (
  placesLibrary: google.maps.PlacesLibrary,
  position: google.maps.LatLngLiteral
): Promise<string | null> =>
  new Promise((resolve) => {
    const service = new placesLibrary.PlacesService(document.createElement('div'));
    service.nearbySearch(
      {
        location: position,
        rankBy: placesLibrary.RankBy.DISTANCE,
        type: 'point_of_interest',
      },
      (results, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !results?.length
        ) {
          resolve(null);
          return;
        }

        const [nearest] = results;
        const nearestPosition = nearest.geometry?.location;
        if (!nearest.name || !nearestPosition) {
          resolve(null);
          return;
        }

        // Measured locally rather than via google.maps.geometry, which would
        // mean loading another library just for one distance check.
        const distanceMetres =
          calculateHaversineDistance(
            { latitude: position.lat, longitude: position.lng },
            { latitude: nearestPosition.lat(), longitude: nearestPosition.lng() }
          ) * 1000;

        resolve(distanceMetres <= MAX_POI_DISTANCE_METRES ? nearest.name : null);
      }
    );
  });

const findAddress = (
  geocodingLibrary: google.maps.GeocodingLibrary,
  position: google.maps.LatLngLiteral
): Promise<string | null> =>
  new Promise((resolve) => {
    const geocoder = new geocodingLibrary.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        resolve(null);
        return;
      }
      resolve(results[0]?.formatted_address ?? null);
    });
  });

const lookupNearestPlace = async (
  placesLibrary: google.maps.PlacesLibrary,
  geocodingLibrary: google.maps.GeocodingLibrary,
  position: google.maps.LatLngLiteral
): Promise<NearestPlace> => {
  const [placeName, address] = await Promise.all([
    findNearestPoi(placesLibrary, position).catch(() => null),
    findAddress(geocodingLibrary, position).catch(() => null),
  ]);
  return { placeName, address };
};

/**
 * Resolves a human friendly description of a location.
 *
 * Locations picked through the place search already carry their name and
 * address, so those are returned as-is with no network call. Only locations
 * saved as raw coordinates — a dropped pin, a WhatsApp order, "use my current
 * location" — are looked up against Google.
 */
export const useNearestPlace = (
  location?: OrderLocation | null
): NearestPlace & { isLoading: boolean } => {
  const placesLibrary = useMapsLibrary('places');
  const geocodingLibrary = useMapsLibrary('geocoding');

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

    if (!placesLibrary || !geocodingLibrary) {
      return;
    }

    const position = { lat: Number(latitude), lng: Number(longitude) };
    const key = cacheKey(position.lat, position.lng);

    let cached = cache.get(key);
    if (!cached) {
      cached = lookupNearestPlace(placesLibrary, geocodingLibrary, position);
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
  }, [isPersisted, latitude, longitude, placesLibrary, geocodingLibrary]);

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
