/**
 * Thin client for the Mapbox Search Box API (address + point-of-interest
 * search). Billing is per *session*: any number of `suggest` calls followed by
 * one `retrieve` share a session token and count once. `reverse` is billed per
 * request.
 *
 * https://docs.mapbox.com/api/search/search-box/
 */
import { ENVIRONMENTS } from '@/constants/environments.constants';
import type { Language } from '@/i18n/i18n';

const BASE_URL = 'https://api.mapbox.com/search/searchbox/v1';

/** Biases results toward Kigali; every caller searches inside Rwanda. */
const DEFAULT_PROXIMITY = '30.0619,-1.9441';

export class MapboxSearchUnavailableError extends Error {}

export interface SearchSuggestion {
  mapboxId: string;
  name: string;
  /** Second line, e.g. "Kigali, Rwanda". */
  placeFormatted: string;
  fullAddress: string | null;
}

export interface SearchFeature {
  mapboxId: string;
  name: string;
  fullAddress: string | null;
  placeFormatted: string;
  featureType: string;
  latitude: number;
  longitude: number;
}

interface RawSuggestion {
  mapbox_id: string;
  name: string;
  place_formatted?: string;
  full_address?: string;
}

interface RawFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    mapbox_id: string;
    name: string;
    feature_type: string;
    full_address?: string;
    place_formatted?: string;
    coordinates?: { latitude: number; longitude: number };
  };
}

// Search Box has no Kinyarwanda results; English is the closest useful match.
const searchLanguage = (language?: Language) => (language === 'fr' ? 'fr' : 'en');

const request = async <T>(
  path: string,
  parameters: Record<string, string | undefined>,
  signal?: AbortSignal,
): Promise<T> => {
  const token = ENVIRONMENTS.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new MapboxSearchUnavailableError('VITE_MAPBOX_ACCESS_TOKEN is not configured.');
  }

  const query = new URLSearchParams({ access_token: token });
  Object.entries(parameters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${BASE_URL}${path}?${query.toString()}`, { signal });
  if (!response.ok) {
    throw new MapboxSearchUnavailableError(`Mapbox search failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const toFeature = ({ geometry, properties }: RawFeature): SearchFeature => ({
  mapboxId: properties.mapbox_id,
  name: properties.name,
  fullAddress: properties.full_address ?? null,
  placeFormatted: properties.place_formatted ?? '',
  featureType: properties.feature_type,
  latitude: properties.coordinates?.latitude ?? geometry.coordinates[1],
  longitude: properties.coordinates?.longitude ?? geometry.coordinates[0],
});

export const createSessionToken = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

export const suggestPlaces = async ({
  query,
  sessionToken,
  country,
  language,
  signal,
}: {
  query: string;
  sessionToken: string;
  country?: string[];
  language?: Language;
  signal?: AbortSignal;
}): Promise<SearchSuggestion[]> => {
  const body = await request<{ suggestions?: RawSuggestion[] }>(
    '/suggest',
    {
      q: query,
      session_token: sessionToken,
      country: country?.join(','),
      language: searchLanguage(language),
      proximity: DEFAULT_PROXIMITY,
      limit: '6',
    },
    signal,
  );

  return (body.suggestions ?? []).map((suggestion) => ({
    mapboxId: suggestion.mapbox_id,
    name: suggestion.name,
    placeFormatted: suggestion.place_formatted ?? '',
    fullAddress: suggestion.full_address ?? null,
  }));
};

export const retrievePlace = async ({
  mapboxId,
  sessionToken,
  language,
}: {
  mapboxId: string;
  sessionToken: string;
  language?: Language;
}): Promise<SearchFeature | null> => {
  const body = await request<{ features?: RawFeature[] }>(
    `/retrieve/${encodeURIComponent(mapboxId)}`,
    { session_token: sessionToken, language: searchLanguage(language) },
  );
  const [feature] = body.features ?? [];
  return feature ? toFeature(feature) : null;
};

export const reverseLookup = async ({
  latitude,
  longitude,
  types,
  language,
}: {
  latitude: number;
  longitude: number;
  types: string;
  language?: Language;
}): Promise<SearchFeature[]> => {
  const body = await request<{ features?: RawFeature[] }>('/reverse', {
    latitude: String(latitude),
    longitude: String(longitude),
    types,
    language: searchLanguage(language),
    limit: '1',
  });
  return (body.features ?? []).map(toFeature);
};
