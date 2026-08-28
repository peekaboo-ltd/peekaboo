import { useEffect, useState } from 'react';

const GEOJS_LOCATION_URL = 'https://get.geojs.io/v1/ip/geo.json';
const LOOKUP_TIMEOUT_MS = 3_000;

export interface ApproximateMapLocation {
  position: {
    lat: number;
    lng: number;
  };
  accuracyKm: number | null;
  label: string;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;

const asFiniteNumber = (value: unknown): number | null => {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asTrimmedString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export const parseApproximateLocation = (
  value: unknown,
): ApproximateMapLocation | null => {
  const response = asRecord(value);
  if (!response) return null;

  const lat = asFiniteNumber(response.latitude);
  const lng = asFiniteNumber(response.longitude);
  if (
    lat === null ||
    lng === null ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  const city = asTrimmedString(response.city);
  const region = asTrimmedString(response.region);
  const country = asTrimmedString(response.country);
  const countryCode = asTrimmedString(response.country_code)?.toUpperCase();
  const locality = city ?? region ?? country ?? 'Near you';
  const label = countryCode ? `${locality}, ${countryCode}` : locality;
  const accuracy = asFiniteNumber(response.accuracy);

  return {
    position: { lat, lng },
    accuracyKm: accuracy !== null && accuracy >= 0 ? accuracy : null,
    label,
  };
};

const fetchApproximateLocation = async (): Promise<ApproximateMapLocation | null> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(GEOJS_LOCATION_URL, {
      credentials: 'omit',
      signal: controller.signal,
    });
    if (!response.ok) return null;

    return parseApproximateLocation(await response.json());
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
};

let locationRequest: Promise<ApproximateMapLocation | null> | null = null;

/**
 * Looks up only a coarse, public-IP-derived viewport hint. The response is kept
 * in memory for this page session and is never written into an order location.
 */
const useApproximateLocation = (enabled: boolean): ApproximateMapLocation | null => {
  const [location, setLocation] = useState<ApproximateMapLocation | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let isCurrent = true;
    locationRequest ??= fetchApproximateLocation();
    void locationRequest.then((nextLocation) => {
      if (isCurrent) setLocation(nextLocation);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled]);

  return location;
};

export default useApproximateLocation;
