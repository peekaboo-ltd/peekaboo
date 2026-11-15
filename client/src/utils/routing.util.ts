import { ENVIRONMENTS } from '@/constants/environments.constants';
import type { LatLng } from '@/components/maps/mapGl';
import {
  calculateHaversineDistance,
  estimateTwoWheelerTime,
} from '@/utils/locations.util';

export interface DrivingRoute {
  distanceKm: number;
  /** Two-wheeler estimate in minutes. */
  durationMinutes: number;
  /** Road geometry when a routing service answered; a straight segment otherwise. */
  path: LatLng[];
  /** False when the numbers are a straight-line estimate. */
  isRoadRoute: boolean;
}

const straightLineRoute = (from: LatLng, to: LatLng): DrivingRoute => {
  const distanceKm = calculateHaversineDistance(
    { latitude: from.lat, longitude: from.lng },
    { latitude: to.lat, longitude: to.lng },
  );
  return {
    distanceKm,
    durationMinutes: estimateTwoWheelerTime(distanceKm),
    path: [from, to],
    isRoadRoute: false,
  };
};

interface MapboxDirectionsResponse {
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
  }[];
}

/**
 * Road route between two points. Uses the Mapbox Directions API when
 * VITE_MAPBOX_ACCESS_TOKEN is set, and otherwise (or on any failure) returns a
 * straight-line estimate, so callers always get numbers to show.
 */
export const fetchDrivingRoute = async (
  from: LatLng,
  to: LatLng,
  signal?: AbortSignal,
): Promise<DrivingRoute> => {
  const token = ENVIRONMENTS.MAPBOX_ACCESS_TOKEN;
  if (!token) return straightLineRoute(from, to);

  try {
    const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const parameters = new URLSearchParams({
      geometries: 'geojson',
      overview: 'full',
      access_token: token,
    });
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?${parameters.toString()}`,
      { signal },
    );
    if (!response.ok) throw new Error(`Directions request failed: ${response.status}`);

    const body = (await response.json()) as MapboxDirectionsResponse;
    const route = body.routes?.[0];
    if (!route) throw new Error('Directions returned no route');

    return {
      distanceKm: route.distance / 1000,
      // Two-wheelers filter through traffic, so trim the car estimate by ~15%.
      durationMinutes: Math.round((route.duration / 60) * 0.85),
      path: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      isRoadRoute: true,
    };
  } catch (error) {
    if (signal?.aborted) throw error;
    console.error('Error calculating route:', error);
    return straightLineRoute(from, to);
  }
};
