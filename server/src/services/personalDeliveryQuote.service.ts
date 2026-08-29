import axios from "axios";
import { getPersonalDeliveryFee } from "../constants/personalDeliveryPricing.constants";
import { ValidationError } from "../helpers/errors.helper";

export interface QuoteCoordinates {
  latitude: number;
  longitude: number;
}

export interface PersonalDeliveryQuote {
  distanceKm: number;
  durationMinutes: number;
  amount: number;
  currency: "RWF";
}

interface RouteMetrics {
  distanceMetres: number;
  durationSeconds: number;
}

const assertCoordinates = (value: QuoteCoordinates, field: string) => {
  if (
    !value ||
    !Number.isFinite(Number(value.latitude)) ||
    !Number.isFinite(Number(value.longitude)) ||
    Number(value.latitude) < -90 ||
    Number(value.latitude) > 90 ||
    Number(value.longitude) < -180 ||
    Number(value.longitude) > 180
  ) {
    throw new ValidationError(`${field} must contain valid coordinates`);
  }
};

export class PersonalDeliveryQuoteService {
  async quote(params: {
    pickup: QuoteCoordinates;
    dropoff: QuoteCoordinates;
  }): Promise<PersonalDeliveryQuote> {
    assertCoordinates(params.pickup, "pickup");
    assertCoordinates(params.dropoff, "dropoff");

    if (
      params.pickup.latitude === params.dropoff.latitude &&
      params.pickup.longitude === params.dropoff.longitude
    ) {
      throw new ValidationError("Pickup and drop-off must be different places");
    }

    const provider = String(process.env.MAPS_PROVIDER || "google").toLowerCase();
    const route =
      provider === "mapbox"
        ? await this.mapboxRoute(params.pickup, params.dropoff)
        : await this.googleRoute(params.pickup, params.dropoff);

    if (
      !Number.isFinite(route.distanceMetres) ||
      route.distanceMetres <= 0 ||
      !Number.isFinite(route.durationSeconds) ||
      route.durationSeconds <= 0
    ) {
      throw new Error("The maps provider did not return a usable driving route");
    }

    const distanceKm = route.distanceMetres / 1000;
    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMinutes: Math.max(1, Math.round((route.durationSeconds / 60) * 0.85)),
      amount: getPersonalDeliveryFee(distanceKm),
      currency: "RWF",
    };
  }

  private async googleRoute(
    pickup: QuoteCoordinates,
    dropoff: QuoteCoordinates,
  ): Promise<RouteMetrics> {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const { data } = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${pickup.latitude},${pickup.longitude}`,
          destination: `${dropoff.latitude},${dropoff.longitude}`,
          mode: "driving",
          key,
        },
        timeout: 10000,
      },
    );

    const leg = data?.routes?.[0]?.legs?.[0];
    if (data?.status !== "OK" || !leg) {
      throw new Error(data?.error_message || "Google could not calculate this route");
    }

    return {
      distanceMetres: Number(leg.distance?.value),
      durationSeconds: Number(leg.duration?.value),
    };
  }

  private async mapboxRoute(
    pickup: QuoteCoordinates,
    dropoff: QuoteCoordinates,
  ): Promise<RouteMetrics> {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MAPBOX_ACCESS_TOKEN is not configured");

    const coordinates = [
      `${pickup.longitude},${pickup.latitude}`,
      `${dropoff.longitude},${dropoff.latitude}`,
    ].join(";");
    const { data } = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`,
      {
        params: { access_token: accessToken, overview: "false" },
        timeout: 10000,
      },
    );

    const route = data?.routes?.[0];
    if (data?.code !== "Ok" || !route) {
      throw new Error(data?.message || "Mapbox could not calculate this route");
    }

    return {
      distanceMetres: Number(route.distance),
      durationSeconds: Number(route.duration),
    };
  }
}
