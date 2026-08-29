import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import axios from "axios";
import { PersonalDeliveryQuoteService } from "./personalDeliveryQuote.service";

const originalGet = axios.get;
const originalProvider = process.env.MAPS_PROVIDER;
const originalGoogleKey = process.env.GOOGLE_MAPS_API_KEY;
const originalMapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

afterEach(() => {
  axios.get = originalGet;
  process.env.MAPS_PROVIDER = originalProvider;
  process.env.GOOGLE_MAPS_API_KEY = originalGoogleKey;
  process.env.MAPBOX_ACCESS_TOKEN = originalMapboxToken;
});

describe("PersonalDeliveryQuoteService", () => {
  it("prices Google driving metrics with the server fee bands", async () => {
    process.env.MAPS_PROVIDER = "google";
    process.env.GOOGLE_MAPS_API_KEY = "test";
    axios.get = (async () => ({
      data: {
        status: "OK",
        routes: [{ legs: [{ distance: { value: 6000 }, duration: { value: 3600 } }] }],
      },
    })) as typeof axios.get;

    const quote = await new PersonalDeliveryQuoteService().quote({
      pickup: { latitude: -1.95, longitude: 30.06 },
      dropoff: { latitude: -1.9, longitude: 30.1 },
    });
    assert.deepEqual(quote, {
      distanceKm: 6,
      durationMinutes: 51,
      amount: 800,
      currency: "RWF",
    });
  });

  it("prices Mapbox driving metrics through the same fee source", async () => {
    process.env.MAPS_PROVIDER = "mapbox";
    process.env.MAPBOX_ACCESS_TOKEN = "test";
    axios.get = (async () => ({
      data: { code: "Ok", routes: [{ distance: 9000, duration: 1800 }] },
    })) as typeof axios.get;

    const quote = await new PersonalDeliveryQuoteService().quote({
      pickup: { latitude: -1.95, longitude: 30.06 },
      dropoff: { latitude: -1.9, longitude: 30.1 },
    });
    assert.deepEqual(quote, {
      distanceKm: 9,
      durationMinutes: 26,
      amount: 1000,
      currency: "RWF",
    });
  });

  it("does not fall back when the maps provider has no driving route", async () => {
    process.env.MAPS_PROVIDER = "google";
    process.env.GOOGLE_MAPS_API_KEY = "test";
    axios.get = (async () => ({ data: { status: "ZERO_RESULTS", routes: [] } })) as typeof axios.get;
    await assert.rejects(
      new PersonalDeliveryQuoteService().quote({
        pickup: { latitude: -1.95, longitude: 30.06 },
        dropoff: { latitude: -1.9, longitude: 30.1 },
      }),
      /could not calculate this route/,
    );
  });
});
