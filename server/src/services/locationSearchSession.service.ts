import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { LocationSearchSession } from "../entities/locationSearchSession.entity";
import { LocationSuggestion } from "../locations/locationSearch.types";
import { parseCompositePlaceId } from "../locations/parseCompositePlaceId";
import { resolveLocationPlace } from "../locations/locationSearch.facade";
import { UUID } from "../types";

const defaultTtlMinutes = () =>
  Math.min(
    Math.max(Number(process.env.LOCATION_SEARCH_SESSION_TTL_MINUTES || 30), 5),
    120,
  );

export class LocationSearchSessionService {
  private readonly repo: Repository<LocationSearchSession>;

  constructor() {
    this.repo = AppDataSource.getRepository(LocationSearchSession);
  }

  async saveSuggestions(params: {
    flowToken: string | null | undefined;
    query: string;
    suggestions: LocationSuggestion[];
  }): Promise<string> {
    const mapsProvider = (process.env.MAPS_PROVIDER || "google").toLowerCase();
    const expiresAt = new Date(
      Date.now() + defaultTtlMinutes() * 60 * 1000,
    );
    const row = await this.repo.save({
      flowToken: params.flowToken ?? null,
      provider: mapsProvider,
      query: params.query,
      suggestionsJson: params.suggestions.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        provider: s.provider,
        providerPlaceId: s.providerPlaceId,
        latitude: s.latitude,
        longitude: s.longitude,
      })) as Record<string, unknown>[],
      expiresAt,
    });
    return row.id;
  }

  async resolveSelectedPickup(params: {
    sessionId: string;
    compositePlaceId: string;
  }): Promise<LocationSuggestion | null> {
    const session = await this.repo.findOne({
      where: { id: params.sessionId as UUID },
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      return null;
    }

    const suggestions = session.suggestionsJson as unknown as LocationSuggestion[];
    let selected = suggestions.find((s) => s.id === params.compositePlaceId);

    if (!selected) {
      try {
        const parsed = parseCompositePlaceId(params.compositePlaceId);
        selected = await resolveLocationPlace(
          parsed.provider,
          parsed.providerPlaceId,
        );
      } catch {
        return null;
      }
      return selected;
    }

    if (
      selected.latitude != null &&
      selected.longitude != null &&
      Number.isFinite(selected.latitude) &&
      Number.isFinite(selected.longitude)
    ) {
      return selected;
    }

    try {
      const parsed = parseCompositePlaceId(selected.id);
      return await resolveLocationPlace(parsed.provider, parsed.providerPlaceId);
    } catch {
      return null;
    }
  }
}
