import axios from "axios";
import logger from "../helpers/logger.helper";
import {
  LocationSearchInput,
  LocationSearchProvider,
  LocationSuggestion,
} from "./locationSearch.types";

const GEOCODE_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

/** Kigali — Mapbox proximity uses longitude, latitude */
const KIGALI_PROXIMITY = "30.0619,-1.9441";

export class MapboxGeocodeProvider implements LocationSearchProvider {
  constructor(private readonly accessToken: string) {}

  async search(input: LocationSearchInput): Promise<LocationSuggestion[]> {
    const limit = input.limit ?? 5;
    const country = (input.country || "RW").toLowerCase();
    try {
      const encoded = encodeURIComponent(input.query);
      const { data } = await axios.get(
        `${GEOCODE_BASE}/${encoded}.json`,
        {
          params: {
            access_token: this.accessToken,
            country,
            limit,
            proximity: KIGALI_PROXIMITY,
          },
          timeout: 10000,
        },
      );

      const features: Array<{
        id: string;
        text?: string;
        place_name?: string;
        center?: [number, number];
      }> = data.features || [];

      return features.slice(0, limit).map((f) => ({
        id: `mapbox:${f.id}`,
        title: f.text || f.place_name || "Location",
        description: f.place_name,
        provider: "mapbox",
        providerPlaceId: f.id,
        latitude: Array.isArray(f.center) ? f.center[1] : undefined,
        longitude: Array.isArray(f.center) ? f.center[0] : undefined,
        raw: f,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.warn("Mapbox geocode search request failed", {
          message: error.message,
        });
      } else {
        logger.warn("Mapbox geocode search failed", { error });
      }
      throw error;
    }
  }

  async resolvePlace(providerPlaceId: string): Promise<LocationSuggestion> {
    try {
      const encoded = encodeURIComponent(providerPlaceId);
      const { data } = await axios.get(`${GEOCODE_BASE}/${encoded}.json`, {
        params: {
          access_token: this.accessToken,
          limit: 1,
        },
        timeout: 10000,
      });

      const f = data.features?.[0];
      if (!f) {
        throw new Error("maps_provider_error");
      }

      return {
        id: `mapbox:${f.id}`,
        title: f.text || f.place_name || "Location",
        description: f.place_name,
        provider: "mapbox",
        providerPlaceId: f.id,
        latitude: Array.isArray(f.center) ? f.center[1] : undefined,
        longitude: Array.isArray(f.center) ? f.center[0] : undefined,
        raw: f,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.warn("Mapbox geocode resolve request failed", {
          message: error.message,
        });
      } else {
        logger.warn("Mapbox geocode resolve failed", { error });
      }
      throw error;
    }
  }
}
