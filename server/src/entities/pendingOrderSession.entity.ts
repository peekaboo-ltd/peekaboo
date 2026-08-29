import { Column, Entity } from "typeorm";
import { AbstractEntity } from "./index";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";
import { OrderPayerType } from "../constants/order.constants";
import { UUID } from "../types";

@Entity("pending_order_sessions")
export class PendingOrderSession extends AbstractEntity {
  @Column({ name: "wa_phone", type: "varchar", length: 64 })
  waPhone: string;

  @Column({ name: "flow_token", type: "text", nullable: true })
  flowToken: string | null;

  @Column({ name: "conversation_id", type: "uuid", nullable: true })
  conversationId: UUID | null;

  @Column({ name: "recipient_conversation_id", type: "uuid", nullable: true })
  recipientConversationId: UUID | null;

  @Column({ name: "order_id", type: "uuid", nullable: true })
  orderId: UUID | null;

  @Column({ name: "payment_id", type: "uuid", nullable: true })
  paymentId: UUID | null;

  @Column({ name: "recipient_phone", type: "varchar", length: 64 })
  recipientPhone: string;

  @Column({ name: "recipient_name", type: "varchar", length: 255, nullable: true })
  recipientName: string | null;

  @Column({
    name: "payer_type",
    type: "enum",
    enum: OrderPayerType,
    nullable: true,
  })
  payerType: OrderPayerType | null;

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

  @Column({ name: "pickup_place_id", type: "text", nullable: true })
  pickupPlaceId: string | null;

  @Column({ name: "dropoff_latitude", type: "double precision", nullable: true })
  dropoffLatitude: number | null;

  @Column({ name: "dropoff_longitude", type: "double precision", nullable: true })
  dropoffLongitude: number | null;

  @Column({ name: "dropoff_address", type: "text", nullable: true })
  dropoffAddress: string | null;

  @Column({ name: "dropoff_name", type: "text", nullable: true })
  dropoffName: string | null;

  @Column({ name: "dropoff_place_id", type: "text", nullable: true })
  dropoffPlaceId: string | null;

  @Column({ name: "quoted_distance_km", type: "double precision", nullable: true })
  quotedDistanceKm: number | null;

  @Column({ name: "quoted_duration_minutes", type: "integer", nullable: true })
  quotedDurationMinutes: number | null;

  @Column({ name: "quoted_amount", type: "numeric", nullable: true })
  quotedAmount: number | null;

  @Column({ name: "invitation_token_hash", type: "varchar", length: 64, nullable: true })
  invitationTokenHash: string | null;

  @Column({ name: "invitation_used_at", type: "timestamptz", nullable: true })
  invitationUsedAt: Date | null;

  @Column({ name: "terminal_reason", type: "text", nullable: true })
  terminalReason: string | null;

  @Column({ name: "metadata_json", type: "jsonb", nullable: true })
  metadataJson: Record<string, unknown> | null;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;
}
