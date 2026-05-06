import { Column, Entity } from "typeorm";
import { AbstractEntity } from "./index";

@Entity("location_search_sessions")
export class LocationSearchSession extends AbstractEntity {
  @Column({ name: "flow_token", type: "text", nullable: true })
  flowToken: string | null;

  @Column({ name: "provider", type: "varchar", length: 32 })
  provider: string;

  @Column({ name: "query", type: "text" })
  query: string;

  @Column({ name: "suggestions_json", type: "jsonb" })
  suggestionsJson: Record<string, unknown>[];

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;
}
