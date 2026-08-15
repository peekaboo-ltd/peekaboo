import type { PlaceSearchResult } from '@/components/inputs/PlaceSearch';
import type { OrderLocation } from '@/types/order.type';

export interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface LocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      } as LocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        } as LocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const calculateHaversineDistance = (
  from: LocationCoordinates,
  to: LocationCoordinates
): number => {
  if (
    !from ||
    !to ||
    from?.latitude === null ||
    from?.longitude === null ||
    to?.latitude === null ||
    to?.longitude === null
  ) {
    return 0;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((to?.latitude - from?.latitude) * Math.PI) / 180;
  const dLon = ((to?.longitude - from?.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from?.latitude * Math.PI) / 180) *
      Math.cos((to?.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const estimateTwoWheelerTime = (distanceKm: number): number => {
  // Average two-wheeler speed in urban areas: 25 km/h
  // Add 20% buffer for traffic and stops
  const avgSpeed = 25;
  const timeHours = (distanceKm / avgSpeed) * 1.2;
  return Math.round(timeHours * 60); // Return in minutes
};

// Keep the human friendly labels alongside the coordinates so the order can be
// described without a reverse geocode lookup later on.
export const placeSearchResultToOrderLocation = (
  result: PlaceSearchResult
): OrderLocation => ({
  latitude: result.coordinates.latitude,
  longitude: result.coordinates.longitude,
  ...(result.name ? { name: result.name } : {}),
  ...(result.formattedAddress ? { formattedAddress: result.formattedAddress } : {}),
  ...(result.placeId ? { placeId: result.placeId } : {}),
});

export const hasCoordinates = (
  location?: OrderLocation | LocationCoordinates | null
): boolean =>
  typeof location?.latitude === 'number' &&
  typeof location?.longitude === 'number' &&
  Number.isFinite(location.latitude) &&
  Number.isFinite(location.longitude);

// Best available single-line description of a location, without any lookups.
export const describeLocation = (location?: OrderLocation | null): string => {
  if (!location) return '';
  return (
    location.name ||
    location.formattedAddress ||
    (hasCoordinates(location)
      ? `${location.latitude?.toFixed(5)}, ${location.longitude?.toFixed(5)}`
      : '')
  );
};

export const openInGoogleMapsUrl = (location?: OrderLocation | null): string | null => {
  if (!hasCoordinates(location)) return null;
  const query = `${location?.latitude},${location?.longitude}`;
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', query);
  // Anchors the pin to the exact place the user picked rather than the raw point.
  if (location?.placeId) {
    url.searchParams.set('query_place_id', location.placeId);
  }
  return url.toString();
};
