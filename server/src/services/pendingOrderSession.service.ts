import { MoreThan, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { PendingOrderSession } from "../entities/pendingOrderSession.entity";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";
import { UUID } from "../types";
import { normalizePhoneNumber } from "../helpers/phone.helper";
import { ValidationError } from "../helpers/errors.helper";

const defaultTtlMinutes = () =>
  Math.min(
    Math.max(Number(process.env.PENDING_ORDER_SESSION_TTL_MINUTES || 30), 5),
    120,
  );

export class PendingOrderSessionService {
  private readonly repo: Repository<PendingOrderSession>;

  constructor() {
    this.repo = AppDataSource.getRepository(PendingOrderSession);
  }

  async createAwaitingPickupLocation(params: {
    waPhone: string;
    flowToken: string | null | undefined;
    conversationId?: UUID | null;
    recipientPhone: string;
    pickupMethod: string;
  }): Promise<PendingOrderSession> {
    const waPhone = normalizePhoneNumber(params.waPhone);
    const recipientPhone = normalizePhoneNumber(params.recipientPhone);
    if (!waPhone || !recipientPhone) {
      throw new ValidationError("Pending order session contains an invalid phone number");
    }

    const expiresAt = new Date(
      Date.now() + defaultTtlMinutes() * 60 * 1000,
    );
    return this.repo.save({
      waPhone,
      flowToken: params.flowToken ?? null,
      conversationId: params.conversationId ?? null,
      recipientPhone,
      pickupMethod: params.pickupMethod,
      status: PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
      pickupLatitude: null,
      pickupLongitude: null,
      pickupAddress: null,
      pickupName: null,
      metadataJson: null,
      expiresAt,
    });
  }

  async findActiveAwaitingPickup(waPhone: string): Promise<PendingOrderSession | null> {
    const normalizedPhone = normalizePhoneNumber(waPhone);
    if (!normalizedPhone) return null;
    return this.repo.findOne({
      where: {
        waPhone: normalizedPhone,
        status: PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async findActiveAwaitingDropOff(waPhone: string): Promise<PendingOrderSession | null> {
    const normalizedPhone = normalizePhoneNumber(waPhone);
    if (!normalizedPhone) return null;
    return this.repo.findOne({
      where: {
        waPhone: normalizedPhone,
        status: PendingOrderSessionStatus.AWAITING_DROP_OFF_ADDRESS,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async applyPickupFromSharedLocation(params: {
    waPhone: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    name?: string | null;
  }): Promise<PendingOrderSession | null> {
    const session = await this.findActiveAwaitingPickup(params.waPhone);
    if (!session || session.expiresAt.getTime() < Date.now()) {
      return null;
    }

    session.pickupLatitude = params.latitude;
    session.pickupLongitude = params.longitude;
    session.pickupAddress = params.address ?? null;
    session.pickupName = params.name ?? null;
    session.status = PendingOrderSessionStatus.AWAITING_DROP_OFF_ADDRESS;
    return this.repo.save(session);
  }

  async markCompleted(sessionId: UUID): Promise<void> {
    await this.repo.update(
      { id: sessionId },
      { status: PendingOrderSessionStatus.COMPLETED },
    );
  }
}
