export type MapsProviderName = "google" | "mapbox";

export type LocationSuggestion = {
  id: string;
  title: string;
  description?: string;
  provider: MapsProviderName;
  providerPlaceId: string;
  latitude?: number;
  longitude?: number;
  raw?: unknown;
};

export type LocationSearchInput = {
  query: string;
  country?: string;
  cityBias?: string;
  limit?: number;
};

export interface LocationSearchProvider {
  search(input: LocationSearchInput): Promise<LocationSuggestion[]>;
  resolvePlace(providerPlaceId: string): Promise<LocationSuggestion>;
}
