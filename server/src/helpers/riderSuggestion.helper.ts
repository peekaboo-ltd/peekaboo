import { User } from '../entities/user.entity';
import { haversineDistance } from './distance.helper';
import { ValidationError } from './errors.helper';

export const RIDER_COORDINATE_PRECISION = 3;
export const REQUEST_COORDINATE_PRECISION = 2;
export const LIVE_FIX_MAX_AGE_MS = 30 * 60 * 1000;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SuggestedRiderPosition {
  latitude: number;
  longitude: number;
  distanceKm: number;
  etaMinutes: number;
  isLive: boolean;
  updatedAt: string | null;
}

const parseCoordinate = (
  value: unknown,
  label: 'latitude' | 'longitude',
  min: number,
  max: number
): number => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new ValidationError(`Invalid ${label}`);
  }

  return Number(parsed.toFixed(REQUEST_COORDINATE_PRECISION));
};

export function parseCoordinateQuery(lat: unknown, lng: unknown): Coordinates {
  return {
    latitude: parseCoordinate(lat, 'latitude', -90, 90),
    longitude: parseCoordinate(lng, 'longitude', -180, 180),
  };
}

const hasCoordinates = (
  location?: { latitude: number; longitude: number } | null
): location is { latitude: number; longitude: number } =>
  Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);

const roundRiderCoordinate = (value: number) =>
  Number(value.toFixed(RIDER_COORDINATE_PRECISION));

export function toSuggestedRiderPosition(
  rider: User,
  pickup: Coordinates,
  now: Date = new Date()
): SuggestedRiderPosition | null {
  const collectedAt = rider.currentLocation?.collectedAt;
  const collectedAtMs = collectedAt ? Date.parse(collectedAt) : Number.NaN;
  const fixAgeMs = now.getTime() - collectedAtMs;
  const hasFreshFix =
    hasCoordinates(rider.currentLocation) &&
    Number.isFinite(collectedAtMs) &&
    fixAgeMs >= 0 &&
    fixAgeMs <= LIVE_FIX_MAX_AGE_MS;

  const location = hasFreshFix
    ? rider.currentLocation
    : hasCoordinates(rider.defaultLocation)
      ? rider.defaultLocation
      : null;

  if (!location) return null;

  const distanceKm = haversineDistance(location, pickup);
  // Mirrors the client estimate: 25 km/h with a 20% traffic/stops buffer.
  const etaMinutes = Math.round((distanceKm / 25) * 1.2 * 60);

  return {
    latitude: roundRiderCoordinate(location.latitude),
    longitude: roundRiderCoordinate(location.longitude),
    distanceKm: Number(distanceKm.toFixed(2)),
    etaMinutes,
    isLive: hasFreshFix,
    updatedAt: hasFreshFix ? collectedAt! : null,
  };
}
