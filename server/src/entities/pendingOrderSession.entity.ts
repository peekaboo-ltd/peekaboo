import { Column, Entity } from "typeorm";
import { AbstractEntity } from "./index";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";
import { UUID } from "../types";

@Entity("pending_order_sessions")
export class PendingOrderSession extends AbstractEntity {
  @Column({ name: "wa_phone", type: "varchar", length: 64 })
  waPhone: string;

  @Column({ name: "flow_token", type: "text", nullable: true })
  flowToken: string | null;

  @Column({ name: "conversation_id", type: "uuid", nullable: true })
  conversationId: UUID | null;

  @Column({ name: "recipient_phone", type: "varchar", length: 64 })
  recipientPhone: string;

  @Column({ name: "pickup_method", type: "varchar", length: 64, nullable: true })
  pickupMethod: string | null;

  @Column({
    name: "status",
    type: "varchar",
    length: 64,
    default: PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
  })
  status: PendingOrderSessionStatus;

  @Column({
    name: "pickup_latitude",
    type: "double precision",
    nullable: true,
  })
  pickupLatitude: number | null;

  @Column({
    name: "pickup_longitude",
    type: "double precision",
    nullable: true,
  })
  pickupLongitude: number | null;

  @Column({ name: "pickup_address", type: "text", nullable: true })
  pickupAddress: string | null;

  @Column({ name: "pickup_name", type: "text", nullable: true })
  pickupName: string | null;

  @Column({ name: "metadata_json", type: "jsonb", nullable: true })
  metadataJson: Record<string, unknown> | null;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;
}
