import crypto from "crypto";
import { In, LessThanOrEqual, MoreThan, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { PendingOrderSession } from "../entities/pendingOrderSession.entity";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";
import { UUID } from "../types";
import { normalizePhoneNumber } from "../helpers/phone.helper";
import { ValidationError } from "../helpers/errors.helper";
import { OrderPayerType } from "../constants/order.constants";

const shortSessionTtlMinutes = () =>
  Math.min(
    Math.max(Number(process.env.PENDING_ORDER_SESSION_TTL_MINUTES || 30), 5),
    120,
  );

export const WHATSAPP_BOOKING_STAGE_TTL_MS = 5 * 60 * 60 * 1000;

const expiresIn = (milliseconds: number) => new Date(Date.now() + milliseconds);

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token, "utf8").digest("hex");

const ACTIVE_STATUSES = [
  PendingOrderSessionStatus.AWAITING_RECIPIENT,
  PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
  PendingOrderSessionStatus.AWAITING_RECIPIENT_INVITATION,
  PendingOrderSessionStatus.AWAITING_DROPOFF_LOCATION,
  PendingOrderSessionStatus.AWAITING_QUOTE_CONFIRMATION,
  PendingOrderSessionStatus.PAYMENT_PENDING,
];

export class PendingOrderSessionService {
  private readonly repo: Repository<PendingOrderSession>;

  constructor() {
    this.repo = AppDataSource.getRepository(PendingOrderSession);
  }

  async createSenderSession(params: {
    waPhone: string;
    flowToken?: string | null;
    conversationId?: UUID | null;
    recipientPhone: string;
    recipientName?: string | null;
  }): Promise<PendingOrderSession> {
    const waPhone = normalizePhoneNumber(params.waPhone);
    const recipientPhone = normalizePhoneNumber(params.recipientPhone);
    if (!waPhone || !recipientPhone) {
      throw new ValidationError("Booking contains an invalid phone number");
    }
    if (waPhone === recipientPhone) {
      throw new ValidationError("Sender and recipient phone numbers must be different");
    }

    await this.cancelActiveForSender(waPhone, "Replaced by a new booking");

    return this.repo.save({
      waPhone,
      flowToken: params.flowToken ?? null,
      conversationId: params.conversationId ?? null,
      recipientConversationId: null,
      orderId: null,
      paymentId: null,
      recipientPhone,
      recipientName: params.recipientName ?? null,
      payerType: null,
      pickupMethod: null,
      status: PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
      pickupLatitude: null,
      pickupLongitude: null,
      pickupAddress: null,
      pickupName: null,
      pickupPlaceId: null,
      dropoffLatitude: null,
      dropoffLongitude: null,
      dropoffAddress: null,
      dropoffName: null,
      dropoffPlaceId: null,
      quotedDistanceKm: null,
      quotedDurationMinutes: null,
      quotedAmount: null,
      invitationTokenHash: null,
      invitationUsedAt: null,
      terminalReason: null,
      metadataJson: null,
      expiresAt: expiresIn(shortSessionTtlMinutes() * 60 * 1000),
    });
  }

  /** Backward-compatible entry used by the location-request branch. */
  async createAwaitingPickupLocation(params: {
    waPhone: string;
    flowToken: string | null | undefined;
    conversationId?: UUID | null;
    recipientPhone: string;
    pickupMethod: string;
  }): Promise<PendingOrderSession> {
    const session = await this.createSenderSession(params);
    return this.update(session.id, { pickupMethod: params.pickupMethod });
  }

  async update(
    id: UUID,
    changes: Partial<PendingOrderSession>,
  ): Promise<PendingOrderSession> {
    const session = await this.repo.findOne({ where: { id } });
    if (!session) throw new ValidationError("WhatsApp booking session not found");
    Object.assign(session, changes);
    return this.repo.save(session);
  }

  async getById(id: UUID): Promise<PendingOrderSession | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findActiveForSender(waPhone: string): Promise<PendingOrderSession | null> {
    const normalized = normalizePhoneNumber(waPhone);
    if (!normalized) return null;
    return this.repo.findOne({
      where: {
        waPhone: normalized,
        status: In(ACTIVE_STATUSES),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async findActiveAwaitingPickup(waPhone: string): Promise<PendingOrderSession | null> {
    const normalized = normalizePhoneNumber(waPhone);
    if (!normalized) return null;
    return this.repo.findOne({
      where: {
        waPhone: normalized,
        status: PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async findActiveAwaitingDropOff(waPhone: string): Promise<PendingOrderSession | null> {
    const normalized = normalizePhoneNumber(waPhone);
    if (!normalized) return null;
    return this.repo.findOne({
      where: {
        recipientPhone: normalized,
        status: PendingOrderSessionStatus.AWAITING_DROPOFF_LOCATION,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async findActiveForPayer(waPhone: string): Promise<PendingOrderSession | null> {
    const normalized = normalizePhoneNumber(waPhone);
    if (!normalized) return null;
    const sessions = await this.repo.find({
      where: {
        status: In([
          PendingOrderSessionStatus.AWAITING_QUOTE_CONFIRMATION,
          PendingOrderSessionStatus.PAYMENT_PENDING,
        ]),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
    return (
      sessions.find((session) =>
        session.payerType === OrderPayerType.SENDER
          ? session.waPhone === normalized
          : session.recipientPhone === normalized,
      ) ?? null
    );
  }

  async applyPickupFromSharedLocation(params: {
    waPhone: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    name?: string | null;
  }): Promise<PendingOrderSession | null> {
    const session = await this.findActiveAwaitingPickup(params.waPhone);
    if (!session) return null;
    return this.update(session.id, {
      pickupLatitude: params.latitude,
      pickupLongitude: params.longitude,
      pickupAddress: params.address ?? null,
      pickupName: params.name ?? null,
      pickupMethod: "current_location",
      expiresAt: expiresIn(shortSessionTtlMinutes() * 60 * 1000),
    });
  }

  async applyDropoffFromSharedLocation(params: {
    waPhone: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    name?: string | null;
  }): Promise<PendingOrderSession | null> {
    const session = await this.findActiveAwaitingDropOff(params.waPhone);
    if (!session) return null;
    if (!session.metadataJson?.recipientAcceptedAt) return null;
    return this.update(session.id, {
      dropoffLatitude: params.latitude,
      dropoffLongitude: params.longitude,
      dropoffAddress: params.address ?? null,
      dropoffName: params.name ?? null,
    });
  }

  async issueInvitation(id: UUID): Promise<{ session: PendingOrderSession; token: string }> {
    const token = crypto.randomBytes(24).toString("base64url");
    const session = await this.update(id, {
      invitationTokenHash: hashToken(token),
      invitationUsedAt: null,
      status: PendingOrderSessionStatus.AWAITING_RECIPIENT_INVITATION,
      expiresAt: expiresIn(WHATSAPP_BOOKING_STAGE_TTL_MS),
    });
    return { session, token };
  }

  async consumeInvitation(params: {
    token: string;
    recipientPhone: string;
    conversationId: UUID;
  }): Promise<PendingOrderSession | null> {
    const phone = normalizePhoneNumber(params.recipientPhone);
    if (!phone) return null;
    const session = await this.repo.findOne({
      where: {
        invitationTokenHash: hashToken(params.token),
        recipientPhone: phone,
        status: PendingOrderSessionStatus.AWAITING_RECIPIENT_INVITATION,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!session || session.invitationUsedAt) return null;
    return this.update(session.id, {
      invitationUsedAt: new Date(),
      recipientConversationId: params.conversationId,
      status: PendingOrderSessionStatus.AWAITING_DROPOFF_LOCATION,
      expiresAt: expiresIn(WHATSAPP_BOOKING_STAGE_TTL_MS),
    });
  }

  async markCompleted(id: UUID): Promise<void> {
    await this.repo.update({ id }, { status: PendingOrderSessionStatus.COMPLETED });
  }

  async cancelActiveForSender(waPhone: string, reason: string): Promise<void> {
    const normalized = normalizePhoneNumber(waPhone);
    if (!normalized) return;
    const sessions = await this.repo.find({
      where: { waPhone: normalized, status: In(ACTIVE_STATUSES) },
    });
    await Promise.all(
      sessions.map((session) =>
        this.repo.update(session.id, {
          status: PendingOrderSessionStatus.CANCELLED,
          terminalReason: reason,
        }),
      ),
    );
  }

  async findExpiredActive(): Promise<PendingOrderSession[]> {
    return this.repo.find({
      where: {
        status: In(ACTIVE_STATUSES),
        expiresAt: LessThanOrEqual(new Date()),
      },
    });
  }
}
