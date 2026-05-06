import { GooglePlacesProvider } from "./googlePlaces.provider";
import { MapboxGeocodeProvider } from "./mapboxGeocode.provider";
import {
  LocationSearchInput,
  LocationSearchProvider,
  LocationSuggestion,
  MapsProviderName,
} from "./locationSearch.types";

function getConfiguredProvider(): LocationSearchProvider {
  const mapsProvider = (
    process.env.MAPS_PROVIDER || "google"
  ).toLowerCase() as MapsProviderName;

  if (mapsProvider === "mapbox") {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      throw new Error("MAPBOX_ACCESS_TOKEN is not configured");
    }
    return new MapboxGeocodeProvider(token);
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }
  return new GooglePlacesProvider(googleKey);
}

export async function searchLocations(
  input: LocationSearchInput,
): Promise<LocationSuggestion[]> {
  const limit = Math.min(
    Number(process.env.MAX_LOCATION_SUGGESTIONS || 5) || 5,
    10,
  );
  const country = process.env.DEFAULT_COUNTRY || "RW";
  const cityBias = process.env.DEFAULT_CITY || "Kigali";

  const provider = getConfiguredProvider();
  return provider.search({
    ...input,
    country: input.country ?? country,
    cityBias: input.cityBias ?? cityBias,
    limit: input.limit ?? limit,
  });
}

export async function resolveLocationPlace(
  provider: MapsProviderName,
  providerPlaceId: string,
): Promise<LocationSuggestion> {
  if (provider === "mapbox") {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      throw new Error("MAPBOX_ACCESS_TOKEN is not configured");
    }
    return new MapboxGeocodeProvider(token).resolvePlace(providerPlaceId);
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }
  return new GooglePlacesProvider(googleKey).resolvePlace(providerPlaceId);
}
