import { MapsProviderName } from "./locationSearch.types";

export type ParsedCompositePlaceId = {
  provider: MapsProviderName;
  providerPlaceId: string;
};

export function parseCompositePlaceId(compositeId: string): ParsedCompositePlaceId {
  const idx = compositeId.indexOf(":");
  if (idx <= 0 || idx === compositeId.length - 1) {
    throw new Error("Invalid pickup selection id");
  }
  const provider = compositeId.slice(0, idx) as MapsProviderName;
  if (provider !== "google" && provider !== "mapbox") {
    throw new Error("Unsupported maps provider in pickup selection");
  }
  return {
    provider,
    providerPlaceId: compositeId.slice(idx + 1),
  };
}
