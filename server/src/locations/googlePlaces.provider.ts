import axios from "axios";
import logger from "../helpers/logger.helper";
import {
  LocationSearchInput,
  LocationSearchProvider,
  LocationSuggestion,
} from "./locationSearch.types";

const PLACES_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

/** Approximate Kigali center for location bias */
const KIGALI_LAT = -1.9441;
const KIGALI_LNG = 30.0619;

export class GooglePlacesProvider implements LocationSearchProvider {
  constructor(private readonly apiKey: string) {}

  async search(input: LocationSearchInput): Promise<LocationSuggestion[]> {
    const limit = input.limit ?? 5;
    try {
      const { data } = await axios.get(PLACES_AUTOCOMPLETE_URL, {
        params: {
          input: input.query,
          key: this.apiKey,
          components: input.country
            ? `country:${String(input.country).toLowerCase()}`
            : "country:rw",
          location: `${KIGALI_LAT},${KIGALI_LNG}`,
          radius: 50000,
          strictbounds: false,
        },
        timeout: 10000,
      });

      if (data.status === "ZERO_RESULTS") {
        return [];
      }

      if (data.status !== "OK") {
        logger.warn(
          `Google Places Autocomplete status=${data.status} ${data.error_message || ""}`,
        );
        throw new Error("maps_provider_error");
      }

      const predictions: Array<{
        place_id: string;
        description: string;
        structured_formatting?: {
          main_text?: string;
          secondary_text?: string;
        };
      }> = data.predictions || [];

      return predictions.slice(0, limit).map((p) => ({
        id: `google:${p.place_id}`,
        title:
          p.structured_formatting?.main_text ||
          p.description.split(",")[0]?.trim() ||
          p.description,
        description: p.structured_formatting?.secondary_text || p.description,
        provider: "google",
        providerPlaceId: p.place_id,
        raw: p,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.warn("Google Places Autocomplete request failed", {
          message: error.message,
        });
      } else {
        logger.warn("Google Places Autocomplete failed", { error });
      }
      throw error;
    }
  }

  async resolvePlace(providerPlaceId: string): Promise<LocationSuggestion> {
    try {
      const { data } = await axios.get(DETAILS_URL, {
        params: {
          place_id: providerPlaceId,
          key: this.apiKey,
          fields: "geometry,name,formatted_address",
        },
        timeout: 10000,
      });

      if (data.status !== "OK" || !data.result) {
        logger.warn("Google Place Details non-OK status", {
          status: data.status,
        });
        throw new Error("maps_provider_error");
      }

      const r = data.result;
      const lat = r.geometry?.location?.lat;
      const lng = r.geometry?.location?.lng;

      return {
        id: `google:${providerPlaceId}`,
        title: r.name || r.formatted_address || "Selected place",
        description: r.formatted_address,
        provider: "google",
        providerPlaceId,
        latitude: typeof lat === "number" ? lat : undefined,
        longitude: typeof lng === "number" ? lng : undefined,
        raw: r,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.warn("Google Place Details request failed", {
          message: error.message,
        });
      } else {
        logger.warn("Google Place Details failed", { error });
      }
      throw error;
    }
  }
}
