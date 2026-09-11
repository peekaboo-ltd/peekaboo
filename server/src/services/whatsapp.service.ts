import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { ConversationStep } from "../constants/conversation.constants";
import { OrderPayerType } from "../constants/order.constants";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";
import { WhatsAppMessageStatus } from "../constants/message.constants";
import { PaymentType } from "../constants/payment.constants";
import { RoleTypes } from "../constants/role.constants";
import { PaymentCurrency, PaymentStatus } from "../types/payment-status.types";
import { PaymentProvider, PaypackChannel } from "../types/paypack.types";
import {
  formatPhoneForProvider,
  normalizePhoneNumber,
  validateAndFormatPhoneNumber,
} from "../helpers/phone.helper";
import {
  sendFlowMessage,
  sendLocationRequestMessage,
  sendMessage,
} from "../helpers/whatsapp.helper";
import { encryptFlowResponse } from "../helpers/whatsapp.flows.helper";
import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";
import { OrderService } from "./order.service";
import { PaymentService } from "./payment.service";
import { UserService } from "./user.service";
import { PendingOrderSession } from "../entities/pendingOrderSession.entity";
import { Payment } from "../entities/payment.entity";
import { UUID } from "../types";
import { searchLocations } from "../locations/locationSearch.facade";
import { LocationSearchSessionService } from "./locationSearchSession.service";
import {
  PendingOrderSessionService,
  WHATSAPP_BOOKING_STAGE_TTL_MS,
} from "./pendingOrderSession.service";
import { PersonalDeliveryQuoteService } from "./personalDeliveryQuote.service";
import { SMSService } from "../integrations/sms/sms.service";
import { ValidationError } from "../helpers/errors.helper";

type FlowContext = {
  conversationId?: UUID;
  sessionId?: UUID;
  role?: "sender" | "recipient" | "payer";
};

const INVITATION_PATTERN = /(?:PEEKABOO\s+INVITE|PB-INVITE)\s+([A-Za-z0-9_-]{20,})/i;
const FIVE_HOURS_FROM_NOW = () => new Date(Date.now() + WHATSAPP_BOOKING_STAGE_TTL_MS);

export class WhatsappService {
  private readonly conversationService = new ConversationService();
  private readonly messageService = new MessageService();
  private readonly userService = new UserService();
  private readonly orderService = new OrderService();
  private readonly paymentService = new PaymentService();
  private readonly locationSearchSessionService = new LocationSearchSessionService();
  private readonly pendingOrderSessionService = new PendingOrderSessionService();
  private readonly quoteService = new PersonalDeliveryQuoteService();
  private readonly smsService = new SMSService();

  async handleMessage(webhook: Record<string, any>): Promise<boolean> {
    const changes = (webhook.entry || []).flatMap((entry: any) => entry.changes || []);
    let handled = false;

    for (const change of changes) {
      const value = change?.value || {};
      for (const status of value.statuses || []) {
        if (status?.id && Object.values(WhatsAppMessageStatus).includes(status.status)) {
          await this.messageService.updateDeliveryStatus(
            status.id,
            status.status as WhatsAppMessageStatus,
            status,
          );
          handled = true;
        }
      }

      const senderProfile = value.contacts?.[0];
      for (const inbound of value.messages || []) {
        const waPhone = normalizePhoneNumber(inbound.from || senderProfile?.wa_id);
        if (!waPhone) continue;
        const sender = await this.userService.createUser(
          { phoneNumber: waPhone, name: senderProfile?.profile?.name },
          [RoleTypes.CUSTOMER],
        );
        const conversation =
          await this.conversationService.getOrCreateActiveWhatsappConversation(sender.id);
        const created = await this.messageService.createInboundIfNew({
          conversationId: conversation.id,
          externalMessageId: inbound.id,
          content: { message: inbound, metadata: value.metadata },
        });
        if (!created) {
          handled = true;
          continue;
        }
        await this.handleInboundMessage({
          inbound,
          waPhone,
          conversationId: conversation.id,
          senderName: senderProfile?.profile?.name,
          conversationStep: conversation.step,
        });
        handled = true;
      }
    }
    return handled;
  }

  private async handleInboundMessage(params: {
    inbound: Record<string, any>;
    waPhone: string;
    conversationId: UUID;
    senderName?: string;
    conversationStep?: ConversationStep;
  }): Promise<void> {
    const { inbound, waPhone, conversationId } = params;

    if (inbound.type === "location" && inbound.location) {
      const latitude = Number(inbound.location.latitude);
      const longitude = Number(inbound.location.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      const pickup = await this.pendingOrderSessionService.applyPickupFromSharedLocation({
        waPhone,
        latitude,
        longitude,
        address: inbound.location.address,
        name: inbound.location.name,
      });
      if (pickup) {
        await this.sendSessionFlow(pickup, "sender", "PAYER", waPhone, conversationId, {
          session_id: pickup.id,
        });
        return;
      }

      const dropoff = await this.pendingOrderSessionService.applyDropoffFromSharedLocation({
        waPhone,
        latitude,
        longitude,
        address: inbound.location.address,
        name: inbound.location.name,
      });
      if (dropoff) {
        await this.prepareQuote(dropoff, conversationId, false);
        return;
      }
    }

    if (inbound.type === "contacts") {
      await this.handleSharedContacts(inbound.contacts || [], waPhone, conversationId);
      return;
    }

    const interactiveId =
      inbound.interactive?.button_reply?.id || inbound.interactive?.list_reply?.id;
    if (interactiveId === "booking_enter_number") {
      await this.sendNewBookingFlow(waPhone, conversationId, params.senderName);
      return;
    }
    if (interactiveId === "booking_send_contact") {
      await this.conversationService.updateConversation(conversationId, {
        step: ConversationStep.AWAITING_RECIPIENT_CONTACT,
      });
      await this.sendText(
        waPhone,
        conversationId,
        "Attach the recipient's WhatsApp contact now. Only valid Rwandan mobile numbers can be used.",
      );
      return;
    }
    if (typeof interactiveId === "string" && interactiveId.startsWith("recipient_contact:")) {
      const phone = normalizePhoneNumber(interactiveId.slice("recipient_contact:".length));
      if (phone) await this.startWithRecipient(waPhone, phone, conversationId);
      return;
    }

    const text = String(inbound.text?.body || "").trim();
    const invitation = text.match(INVITATION_PATTERN);
    if (invitation) {
      const session = await this.pendingOrderSessionService.consumeInvitation({
        token: invitation[1],
        recipientPhone: waPhone,
        conversationId,
      });
      if (!session) {
        await this.sendText(
          waPhone,
          conversationId,
          "This invitation is invalid, expired, already used, or belongs to another phone number.",
        );
        return;
      }
      await this.sendSessionFlow(
        session,
        "recipient",
        "RECIPIENT_DECISION",
        waPhone,
        conversationId,
        { session_id: session.id },
      );
      return;
    }

    const awaitingPickup = await this.pendingOrderSessionService.findActiveAwaitingPickup(waPhone);
    const awaitingDropoff = await this.pendingOrderSessionService.findActiveAwaitingDropOff(waPhone);
    if (awaitingDropoff && !awaitingDropoff.metadataJson?.recipientAcceptedAt) {
      await this.sendSessionFlow(
        awaitingDropoff,
        "recipient",
        "RECIPIENT_DECISION",
        waPhone,
        conversationId,
        { session_id: awaitingDropoff.id },
      );
      return;
    }
    if (awaitingPickup || awaitingDropoff) {
      await this.sendText(
        waPhone,
        conversationId,
        "Please use WhatsApp's Send location button. Typed addresses are not accepted for this booking.",
      );
      return;
    }

    const payerSession = await this.pendingOrderSessionService.findActiveForPayer(waPhone);
    if (payerSession) {
      const payment = payerSession.paymentId
        ? await AppDataSource.getRepository(Payment).findOne({ where: { id: payerSession.paymentId } })
        : null;
      if (
        payerSession.status === PendingOrderSessionStatus.AWAITING_QUOTE_CONFIRMATION ||
        payment?.status === PaymentStatus.FAILED
      ) {
        await this.sendSessionFlow(
          payerSession,
          "payer",
          "QUOTE",
          waPhone,
          conversationId,
          this.quoteScreenData(payerSession),
        );
      } else {
        await this.sendText(
          waPhone,
          conversationId,
          "Payment is still pending. Complete the wallet prompt or hosted card checkout before the quote expires.",
        );
      }
      return;
    }

    if (params.conversationStep === ConversationStep.AWAITING_RECIPIENT_CONTACT) {
      await this.sendText(
        waPhone,
        conversationId,
        "Use the attachment button and choose Contact, then send the recipient's contact card.",
      );
      return;
    }
    await this.sendStartMenu(waPhone, conversationId, params.senderName);
  }

  private async handleSharedContacts(
    contacts: Record<string, any>[],
    senderPhone: string,
    conversationId: UUID,
  ): Promise<void> {
    const candidates = new Map<string, string>();
    for (const contact of contacts) {
      for (const entry of contact.phones || []) {
        const result = validateAndFormatPhoneNumber(entry.wa_id || entry.phone);
        if (
          result.isValid &&
          result.e164 &&
          result.type === "MOBILE" &&
          result.e164 !== senderPhone
        ) {
          candidates.set(result.e164, contact.name?.formatted_name || result.international || result.e164);
        }
      }
    }
    const options = Array.from(candidates.entries());
    if (!options.length) {
      await this.sendText(
        senderPhone,
        conversationId,
        "That contact does not contain a valid Rwandan mobile number different from your own.",
      );
      return;
    }
    if (options.length === 1) {
      await this.startWithRecipient(senderPhone, options[0][0], conversationId, options[0][1]);
      return;
    }
    const response = await sendMessage({
      phoneNumber: senderPhone,
      type: "interactive",
      message: {
        type: "list",
        body: { text: "Choose the recipient number for this delivery." },
        action: {
          button: "Choose number",
          sections: [{
            title: "Valid mobile numbers",
            rows: options.slice(0, 10).map(([phone, label]) => ({
              id: `recipient_contact:${phone}`,
              title: label.slice(0, 24),
              description: phone,
            })),
          }],
        },
      },
    });
    await this.recordOutbound(conversationId, response, { kind: "recipient_contact_list" });
  }

  private async startWithRecipient(
    senderPhone: string,
    recipientPhone: string,
    conversationId: UUID,
    recipientName?: string,
  ): Promise<void> {
    const session = await this.pendingOrderSessionService.createSenderSession({
      waPhone: senderPhone,
      recipientPhone,
      recipientName,
      conversationId,
    });
    await this.sendSessionFlow(session, "sender", "PICKUP_METHOD", senderPhone, conversationId, {
      session_id: session.id,
      recipient_phone: recipientPhone,
    });
  }

  async handleFlowSubmission(
    decryptedBody: Record<string, any>,
    senderPhone: string,
    context: FlowContext,
    aesKeyBuffer: Buffer,
    ivBuffer: Buffer,
  ): Promise<string> {
    const screen = String(decryptedBody.screen || "SENDER_RECIPIENT");
    const data = decryptedBody.data || {};
    const respond = (nextScreen: string, responseData: Record<string, any> = {}) =>
      encryptFlowResponse({ screen: nextScreen, data: responseData }, aesKeyBuffer, ivBuffer);

    try {
      if (screen === "SENDER_RECIPIENT") {
        const result = validateAndFormatPhoneNumber(data.recipient_phone);
        if (!result.isValid || !result.e164 || result.type !== "MOBILE") {
          return respond(screen, { error: "Enter a valid Rwandan mobile number." });
        }
        if (result.e164 === normalizePhoneNumber(senderPhone)) {
          return respond(screen, { error: "The recipient must be different from the sender." });
        }
        const session = await this.pendingOrderSessionService.createSenderSession({
          waPhone: senderPhone,
          recipientPhone: result.e164,
          conversationId: context.conversationId ?? null,
          flowToken: decryptedBody.flow_token,
        });
        return respond("PICKUP_METHOD", { session_id: session.id, recipient_phone: result.e164 });
      }

      const sessionId = (data.session_id || context.sessionId) as UUID | undefined;
      const session = sessionId ? await this.pendingOrderSessionService.getById(sessionId) : null;
      if (!session || session.expiresAt.getTime() <= Date.now()) {
        return respond(screen, { error: "This booking step expired. Please restart the booking." });
      }
      this.assertFlowParticipant(session, senderPhone, context.role);
      this.assertScreenAccess(session, senderPhone, screen);

      if (screen === "PICKUP_METHOD" || screen === "DROPOFF_METHOD") {
        const method = String(data.location_method || "");
        const pickup = screen === "PICKUP_METHOD";
        if (method === "search") {
          return respond(pickup ? "PICKUP_SEARCH" : "DROPOFF_SEARCH", { session_id: session.id });
        }
        if (method === "gps") {
          await this.pendingOrderSessionService.update(session.id, {
            ...(pickup ? { pickupMethod: "gps" } : {}),
          });
          const locationResponse = await sendLocationRequestMessage({
            phoneNumber: senderPhone,
            bodyText: `Share the ${pickup ? "pickup" : "drop-off"} location using WhatsApp's location picker.`,
          });
          const locationConversationId = context.conversationId ||
            (pickup ? session.conversationId : session.recipientConversationId);
          if (locationConversationId) {
            await this.recordOutbound(locationConversationId, locationResponse, {
              kind: "location_request",
              sessionId: session.id,
              locationKind: pickup ? "pickup" : "drop-off",
            });
          }
          return respond("LOCATION_REQUEST_NOTICE", {
            location_kind: pickup ? "pickup" : "drop-off",
          });
        }
        return respond(screen, { session_id: session.id, error: "Choose Search or GPS." });
      }

      if (screen === "PICKUP_SEARCH" || screen === "DROPOFF_SEARCH") {
        const query = String(data.location_query || "").trim();
        if (!query) return respond(screen, { session_id: session.id, error: "Enter a place to search." });
        const suggestions = await searchLocations({ query });
        if (!suggestions.length) {
          return respond(screen, { session_id: session.id, error: "No matching places were found." });
        }
        const searchSessionId = await this.locationSearchSessionService.saveSuggestions({
          flowToken: decryptedBody.flow_token,
          query,
          suggestions,
        });
        return respond(screen === "PICKUP_SEARCH" ? "PICKUP_RESULTS" : "DROPOFF_RESULTS", {
          session_id: session.id,
          search_session_id: searchSessionId,
          location_options: suggestions.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
          })),
        });
      }

      if (screen === "PICKUP_RESULTS" || screen === "DROPOFF_RESULTS") {
        const selected = await this.locationSearchSessionService.resolveSelectedPickup({
          sessionId: String(data.search_session_id || ""),
          compositePlaceId: String(data.location_place_id || ""),
        });
        if (selected?.latitude == null || selected.longitude == null) {
          return respond(screen === "PICKUP_RESULTS" ? "PICKUP_SEARCH" : "DROPOFF_SEARCH", {
            session_id: session.id,
            error: "That search expired. Search again.",
          });
        }
        const location = {
          latitude: selected.latitude,
          longitude: selected.longitude,
          address: selected.description || null,
          name: selected.title || null,
          placeId: selected.id,
        };
        if (screen === "PICKUP_RESULTS") {
          await this.pendingOrderSessionService.update(session.id, {
            pickupLatitude: location.latitude,
            pickupLongitude: location.longitude,
            pickupAddress: location.address,
            pickupName: location.name,
            pickupPlaceId: location.placeId,
            pickupMethod: "search",
          });
          return respond("PAYER", { session_id: session.id });
        }
        const updated = await this.pendingOrderSessionService.update(session.id, {
          dropoffLatitude: location.latitude,
          dropoffLongitude: location.longitude,
          dropoffAddress: location.address,
          dropoffName: location.name,
          dropoffPlaceId: location.placeId,
        });
        try {
          const quote = await this.prepareQuote(updated, context.conversationId, true);
          if (updated.payerType === OrderPayerType.RECIPIENT) {
            return respond("QUOTE", this.quoteScreenData(updated, quote));
          }
          return respond("WAITING_FOR_PAYER", { order_reference: quote.orderReference });
        } catch (error) {
          return respond("DROPOFF_METHOD", {
            session_id: session.id,
            error: error instanceof Error ? error.message : "Route pricing failed. Please retry.",
          });
        }
      }

      if (screen === "PAYER") {
        const payerType = String(data.payer_type || "").toUpperCase() as OrderPayerType;
        if (!Object.values(OrderPayerType).includes(payerType)) {
          return respond(screen, { session_id: session.id, error: "Choose who will pay." });
        }
        const updated = await this.pendingOrderSessionService.update(session.id, { payerType });
        return respond("SENDER_REVIEW", {
          session_id: updated.id,
          recipient_phone: updated.recipientPhone,
          pickup_label: this.pickupLabel(updated),
          payer_label: payerType === OrderPayerType.SENDER ? "Sender" : "Recipient",
        });
      }

      if (screen === "SENDER_REVIEW") {
        if (
          session.status === PendingOrderSessionStatus.AWAITING_RECIPIENT_INVITATION &&
          session.orderId &&
          session.metadataJson?.invitationSentAt
        ) {
          return respond("INVITATION_SENT", {
            order_reference: String(session.metadataJson?.orderReference || session.orderId),
          });
        }
        const updated = await this.createDraftAndInvite(session);
        return respond("INVITATION_SENT", {
          order_reference: String(updated.metadataJson?.orderReference || updated.orderId || ""),
        });
      }

      if (screen === "RECIPIENT_DECISION") {
        if (data.decision === "decline") {
          if (session.orderId) await this.orderService.cancelWhatsappOrder(session.orderId, "Recipient declined");
          await this.pendingOrderSessionService.update(session.id, {
            status: PendingOrderSessionStatus.DECLINED,
            terminalReason: "Recipient declined the invitation",
          });
          if (session.conversationId) {
            await this.sendText(session.waPhone, session.conversationId, "The recipient declined this delivery. Start a new booking to try again.");
          }
          return respond("DECLINED", {});
        }
        if (data.decision !== "accept") {
          return respond(screen, { session_id: session.id, error: "Accept or decline the invitation." });
        }
        const acceptedAt = new Date();
        if (session.orderId) {
          await this.orderService.markRecipientWhatsappOptIn(session.orderId, acceptedAt);
        }
        await this.pendingOrderSessionService.update(session.id, {
          metadataJson: {
            ...(session.metadataJson || {}),
            recipientAcceptedAt: acceptedAt.toISOString(),
          },
        });
        return respond("DROPOFF_METHOD", { session_id: session.id });
      }

      if (screen === "QUOTE") {
        if (data.approve_quote !== true && data.approve_quote !== "true") {
          return respond(screen, { ...this.quoteScreenData(session), error: "Approve the calculated fee to continue." });
        }
        const method = String(data.payment_method || "") as PaypackChannel;
        if (!Object.values(PaypackChannel).includes(method)) {
          return respond(screen, { ...this.quoteScreenData(session), error: "Choose MTN Mobile Money or Airtel Money." });
        }
        await this.initiatePayment(session, method, senderPhone);
        return respond("PAYMENT_PENDING", { payment_method: method });
      }

      return respond(screen, { error: "Unsupported booking step." });
    } catch (error) {
      return respond(screen, {
        ...data,
        error: error instanceof Error ? error.message : "Unable to process this step.",
      });
    }
  }

  private async createDraftAndInvite(session: PendingOrderSession): Promise<PendingOrderSession> {
    if (!session.payerType || session.pickupLatitude == null || session.pickupLongitude == null) {
      throw new ValidationError("Pickup location and payer are required");
    }
    let orderId = session.orderId;
    let orderReference = String(session.metadataJson?.orderReference || "");
    if (!orderId) {
      const order = await this.orderService.createWhatsappDraftOrder({
        senderPhoneNumber: session.waPhone,
        recipientPhoneNumber: session.recipientPhone,
        recipientName: session.recipientName,
        conversationId: session.conversationId,
        payerType: session.payerType,
        locationFrom: {
          latitude: session.pickupLatitude,
          longitude: session.pickupLongitude,
          name: session.pickupName || undefined,
          formattedAddress: session.pickupAddress || undefined,
          placeId: session.pickupPlaceId || undefined,
        },
      });
      orderId = order.id;
      orderReference = order.referenceId;
      session = await this.pendingOrderSessionService.update(session.id, {
        orderId,
        metadataJson: { ...(session.metadataJson || {}), orderReference },
      });
    }

    const { session: invited, token } = await this.pendingOrderSessionService.issueInvitation(session.id);
    const publicNumber = formatPhoneForProvider(process.env.WHATSAPP_BUSINESS_PUBLIC_NUMBER);
    if (!publicNumber) throw new Error("WHATSAPP_BUSINESS_PUBLIC_NUMBER is not configured");
    const prefilled = `PEEKABOO INVITE ${token}\nI consent to provide the drop-off and receive updates for order ${orderReference}.`;
    const link = `https://wa.me/${publicNumber}?text=${encodeURIComponent(prefilled)}`;
    const result = await this.smsService.send({
      to: session.recipientPhone,
      text: `Peekaboo delivery ${orderReference}: the sender invited you to provide the drop-off. This private invitation expires in 5 hours: ${link}`,
    });
    if (!result) throw new Error("The recipient invitation SMS could not be sent. Retry this step.");
    return this.pendingOrderSessionService.update(invited.id, {
      metadataJson: {
        ...(invited.metadataJson || {}),
        invitationSentAt: new Date().toISOString(),
      },
    });
  }

  private async prepareQuote(
    session: PendingOrderSession,
    recipientConversationId?: UUID,
    returnRecipientQuoteInCurrentFlow = false,
  ): Promise<{ distanceKm: number; durationMinutes: number; amount: number; currency: "RWF"; orderReference: string }> {
    if (
      !session.orderId ||
      session.pickupLatitude == null || session.pickupLongitude == null ||
      session.dropoffLatitude == null || session.dropoffLongitude == null
    ) throw new ValidationError("Both resolved locations are required before quoting");

    const quote = await this.quoteService.quote({
      pickup: { latitude: session.pickupLatitude, longitude: session.pickupLongitude },
      dropoff: { latitude: session.dropoffLatitude, longitude: session.dropoffLongitude },
    });
    const expiresAt = FIVE_HOURS_FROM_NOW();
    const order = await this.orderService.recordWhatsappQuote({
      orderId: session.orderId,
      locationTo: {
        latitude: session.dropoffLatitude,
        longitude: session.dropoffLongitude,
        name: session.dropoffName || undefined,
        formattedAddress: session.dropoffAddress || undefined,
        placeId: session.dropoffPlaceId || undefined,
      },
      amount: quote.amount,
      distanceKm: quote.distanceKm,
      durationMinutes: quote.durationMinutes,
      paymentExpiresAt: expiresAt,
      recipientWhatsappOptInAt: new Date(
        String(session.metadataJson?.recipientAcceptedAt || Date.now()),
      ),
    });
    const updated = await this.pendingOrderSessionService.update(session.id, {
      recipientConversationId: recipientConversationId ?? session.recipientConversationId,
      quotedDistanceKm: quote.distanceKm,
      quotedDurationMinutes: quote.durationMinutes,
      quotedAmount: quote.amount,
      status: PendingOrderSessionStatus.AWAITING_QUOTE_CONFIRMATION,
      expiresAt,
    });
    const payerPhone = updated.payerType === OrderPayerType.SENDER ? updated.waPhone : updated.recipientPhone;
    const payerConversationId = updated.payerType === OrderPayerType.SENDER
      ? updated.conversationId
      : updated.recipientConversationId;
    if (!payerConversationId) throw new Error("The payer's WhatsApp conversation is unavailable");
    if (!(updated.payerType === OrderPayerType.RECIPIENT && returnRecipientQuoteInCurrentFlow)) {
      await this.sendSessionFlow(updated, "payer", "QUOTE", payerPhone, payerConversationId, this.quoteScreenData(updated, {
        ...quote,
        orderReference: order.referenceId,
      }));
    }
    return { ...quote, orderReference: order.referenceId };
  }

  private async initiatePayment(
    session: PendingOrderSession,
    method: PaypackChannel,
    payerPhone: string,
    customerName = "",
    customerEmail = "",
  ): Promise<Payment> {
    if (!session.orderId || !session.quotedAmount || session.expiresAt.getTime() <= Date.now()) {
      throw new ValidationError("This quote has expired or is incomplete");
    }
    const existing = session.paymentId
      ? await AppDataSource.getRepository(Payment).findOne({ where: { id: session.paymentId } })
      : null;
    if (existing && existing.status !== PaymentStatus.FAILED) return existing;

    const order = await this.orderService.confirmWhatsappQuote(session.orderId);
    const payer = await this.userService.getUserByCondition({ phoneNumber: payerPhone });
    const paymentAttemptNumber = Number(session.metadataJson?.paymentAttemptNumber || 0) + 1;
    const idempotencyKey = `whatsapp:${session.id}:${paymentAttemptNumber}`;
    let payment: Payment;
    try {
      payment = await this.paymentService.createPayment({
        idempotencyKey,
        entityId: order.id,
        amount: Number(order.finalFee),
        currency: PaymentCurrency.RWF,
        type: PaymentType.ORDER,
        customerPhone: payerPhone,
        customerName: customerName || payer?.name || "WhatsApp customer",
        customerEmail: customerEmail || payer?.email || "",
        createdById: payer?.id,
        provider: PaymentProvider.PAYPACK,
        channelName: method,
        metadata: {
          source: "whatsapp_personal",
          whatsappBookingSessionId: session.id,
          conversationId: session.payerType === OrderPayerType.SENDER
            ? session.conversationId
            : session.recipientConversationId,
          orderId: order.id,
          payerType: session.payerType,
          paymentAttemptNumber,
        },
      });
    } catch (error) {
      if ((error as { code?: string })?.code !== "23505") throw error;
      const duplicate = await AppDataSource.getRepository(Payment).findOne({
        where: { idempotencyKey },
      });
      if (!duplicate) throw error;
      payment = duplicate;
    }
    await this.pendingOrderSessionService.update(session.id, {
      paymentId: payment.id,
      metadataJson: {
        ...(session.metadataJson || {}),
        paymentAttemptNumber,
      },
      status: payment.status === PaymentStatus.SUCCESSFUL
        ? PendingOrderSessionStatus.PAID
        : PendingOrderSessionStatus.PAYMENT_PENDING,
    });

    const conversationId = session.payerType === OrderPayerType.SENDER
      ? session.conversationId
      : session.recipientConversationId;
    if (conversationId) {
      await this.sendText(
        payerPhone,
        conversationId,
        `Approve the ${method === PaypackChannel.MOMO ? "MTN MoMo" : "Airtel Money"} wallet prompt for order ${order.referenceId}. No payment link is required.`,
      );
      await this.conversationService.updateConversation(conversationId, {
        step: ConversationStep.PAYMENT_PENDING,
      });
    }
    return payment;
  }

  private assertFlowParticipant(
    session: PendingOrderSession,
    phone: string,
    role?: FlowContext["role"],
  ): void {
    const normalized = normalizePhoneNumber(phone);
    const allowed = role === "sender"
      ? normalized === session.waPhone
      : role === "recipient"
        ? normalized === session.recipientPhone
        : normalized === session.waPhone || normalized === session.recipientPhone;
    if (!allowed) throw new ValidationError("This booking step belongs to another WhatsApp number");
  }

  private assertScreenAccess(
    session: PendingOrderSession,
    phone: string,
    screen: string,
  ): void {
    if ([
      PendingOrderSessionStatus.PAID,
      PendingOrderSessionStatus.DECLINED,
      PendingOrderSessionStatus.EXPIRED,
      PendingOrderSessionStatus.CANCELLED,
      PendingOrderSessionStatus.COMPLETED,
    ].includes(session.status)) {
      throw new ValidationError("This booking is already closed");
    }

    const normalized = normalizePhoneNumber(phone);
    const senderScreens = new Set([
      "PICKUP_METHOD",
      "PICKUP_SEARCH",
      "PICKUP_RESULTS",
      "PAYER",
      "SENDER_REVIEW",
    ]);
    const recipientScreens = new Set([
      "RECIPIENT_DECISION",
      "DROPOFF_METHOD",
      "DROPOFF_SEARCH",
      "DROPOFF_RESULTS",
    ]);
    const payerScreens = new Set(["QUOTE"]);

    if (senderScreens.has(screen) && normalized !== session.waPhone) {
      throw new ValidationError("Only the sender can complete this booking step");
    }
    if (recipientScreens.has(screen) && normalized !== session.recipientPhone) {
      throw new ValidationError("Only the invited recipient can complete this step");
    }
    if (payerScreens.has(screen)) {
      const payerPhone = session.payerType === OrderPayerType.SENDER
        ? session.waPhone
        : session.recipientPhone;
      if (normalized !== payerPhone) {
        throw new ValidationError("Only the selected payer can approve this quote");
      }
    }

    const status = session.status;
    if (
      ["PICKUP_METHOD", "PICKUP_SEARCH", "PICKUP_RESULTS", "PAYER"].includes(screen) &&
      status !== PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION
    ) {
      throw new ValidationError("The pickup step is no longer active");
    }
    if (
      screen === "SENDER_REVIEW" &&
      ![
        PendingOrderSessionStatus.AWAITING_PICKUP_LOCATION,
        PendingOrderSessionStatus.AWAITING_RECIPIENT_INVITATION,
      ].includes(status)
    ) {
      throw new ValidationError("The sender review is no longer active");
    }
    if (
      recipientScreens.has(screen) &&
      status !== PendingOrderSessionStatus.AWAITING_DROPOFF_LOCATION
    ) {
      throw new ValidationError("The recipient location step is no longer active");
    }
    if (
      payerScreens.has(screen) &&
      ![
        PendingOrderSessionStatus.AWAITING_QUOTE_CONFIRMATION,
        PendingOrderSessionStatus.PAYMENT_PENDING,
      ].includes(status)
    ) {
      throw new ValidationError("The quote is no longer active");
    }
  }

  private quoteScreenData(session: PendingOrderSession, override?: Record<string, any>) {
    return {
      session_id: session.id,
      pickup_label: this.pickupLabel(session),
      dropoff_label: session.dropoffName || session.dropoffAddress || "Shared location",
      distance_label: `${override?.distanceKm ?? session.quotedDistanceKm ?? 0} km`,
      duration_label: `${override?.durationMinutes ?? session.quotedDurationMinutes ?? 0} min`,
      amount_label: `${Number(override?.amount ?? session.quotedAmount ?? 0).toLocaleString()} RWF`,
      payer_label: session.payerType === OrderPayerType.SENDER ? "Sender" : "Recipient",
    };
  }

  private pickupLabel(session: PendingOrderSession): string {
    return session.pickupName || session.pickupAddress || "Shared location";
  }

  private async sendStartMenu(phoneNumber: string, conversationId: UUID, name?: string) {
    const response = await sendMessage({
      phoneNumber,
      type: "interactive",
      message: {
        type: "button",
        body: { text: `Hi${name ? ` ${name}` : ""}. Start a personal delivery by entering or sharing the recipient's number.` },
        action: { buttons: [
          { type: "reply", reply: { id: "booking_enter_number", title: "Enter number" } },
          { type: "reply", reply: { id: "booking_send_contact", title: "Send contact" } },
        ] },
      },
    });
    await this.recordOutbound(conversationId, response, { kind: "booking_start" });
  }

  private async sendNewBookingFlow(phoneNumber: string, conversationId: UUID, name?: string) {
    const flowId = process.env.WHATSAPP_FLOW_ID;
    const secret = process.env.WHATSAPP_FLOW_TOKEN_SECRET;
    if (!flowId || !secret) throw new Error("WhatsApp Flow is not configured");
    const token = jwt.sign({ phone: phoneNumber, conversationId, role: "sender" }, secret, { expiresIn: "24h" });
    const response = await sendFlowMessage({
      phoneNumber,
      flowId,
      flowToken: token,
      bodyText: `Hi${name ? ` ${name}` : ""}. Enter the recipient to begin your personal delivery.`,
      startScreen: "SENDER_RECIPIENT",
      ctaText: "Start booking",
    });
    await this.recordOutbound(conversationId, response, { kind: "flow", screen: "SENDER_RECIPIENT" });
  }

  private async sendSessionFlow(
    session: PendingOrderSession,
    role: FlowContext["role"],
    screen: string,
    phoneNumber: string,
    conversationId: UUID,
    data: Record<string, any>,
  ) {
    const flowId = process.env.WHATSAPP_FLOW_ID;
    const secret = process.env.WHATSAPP_FLOW_TOKEN_SECRET;
    if (!flowId || !secret) throw new Error("WhatsApp Flow is not configured");
    const token = jwt.sign({ phone: phoneNumber, conversationId, sessionId: session.id, role }, secret, { expiresIn: "6h" });
    const response = await sendFlowMessage({
      phoneNumber,
      flowId,
      flowToken: token,
      bodyText: screen === "QUOTE" ? "Your delivery quote is ready." : "Continue your Peekaboo delivery booking.",
      startScreen: screen,
      data,
      ctaText: screen === "QUOTE" ? "Review quote" : "Continue",
    });
    await this.recordOutbound(conversationId, response, { kind: "flow", screen, sessionId: session.id });
  }

  private async sendText(phoneNumber: string, conversationId: UUID, message: string) {
    const response = await sendMessage({ phoneNumber, type: "text", message });
    await this.recordOutbound(conversationId, response, { kind: "text", message });
  }

  private async recordOutbound(
    conversationId: UUID,
    response: any,
    content: Record<string, any>,
  ) {
    const externalMessageId = response?.data?.messages?.[0]?.id;
    await this.messageService.recordOutbound({ conversationId, externalMessageId, content });
  }
}
