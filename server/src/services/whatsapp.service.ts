import jwt from "jsonwebtoken";
import { ConversationStep } from "../constants/conversation.constants";
import { OrderType } from "../constants/order.constants";
import { PaymentType } from "../constants/payment.constants";
import { RoleTypes } from "../constants/role.constants";
import { KpayCurrency } from "../types/kpay.types";
import { PaymentProvider } from "../types/urubuto.types";
import { formatPhoneNumber } from "../helpers/phone.helper";
import {
  sendCtaUrlButton,
  sendFlowMessage,
  sendLocationRequestMessage,
  sendMessage,
} from "../helpers/whatsapp.helper";
import { encryptFlowResponse } from "../helpers/whatsapp.flows.helper";
import {
  flowCTABodyText,
  paymentCTABodyText,
} from "../templates/whatsapp/whatsapp.template";
import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";
import { OrderService } from "./order.service";
import { PaymentService } from "./payment.service";
import { UserService } from "./user.service";
import { Order } from "../entities/order.entity";
import { PendingOrderSession } from "../entities/pendingOrderSession.entity";
import { UUID } from "../types";
import { searchLocations } from "../locations/locationSearch.facade";
import { LocationSearchSessionService } from "./locationSearchSession.service";
import { PendingOrderSessionService } from "./pendingOrderSession.service";

const DEFAULT_ORDER_FEE = 1500;

type FlowDataExchangeScreen = "PICKUP_METHOD" | "PICKUP_SEARCH" | "DROPOFF";

function isFlowDataExchangeScreen(
  screen: string | undefined,
): screen is FlowDataExchangeScreen {
  return (
    screen === "PICKUP_METHOD" ||
    screen === "PICKUP_SEARCH" ||
    screen === "DROPOFF"
  );
}

function assertNever(x: never): never {
  throw new Error(`Unexpected exhaustive value: ${String(x)}`);
}

export class WhatsappService {
  private readonly conversationService: ConversationService;
  private readonly messageService: MessageService;
  private readonly userService: UserService;
  private readonly orderService: OrderService;
  private readonly paymentService: PaymentService;
  private readonly locationSearchSessionService: LocationSearchSessionService;
  private readonly pendingOrderSessionService: PendingOrderSessionService;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
    this.userService = new UserService();
    this.orderService = new OrderService();
    this.paymentService = new PaymentService();
    this.locationSearchSessionService = new LocationSearchSessionService();
    this.pendingOrderSessionService = new PendingOrderSessionService();
  }

  async handleMessage(message: Record<string, any>) {
    const { entry } = message;
    const { value } = entry[0].changes[0];
    const { contacts, messages } = value;

    if (!contacts || !messages) {
      return false;
    }

    const m0 = messages[0];
    const msgType = m0?.type;

    if (msgType !== "text" && msgType !== "interactive" && msgType !== "location") {
      return false;
    }

    const { profile, wa_id } = contacts[0];
    const { name } = profile || {};
    const sender = await this.userService.createUser(
      { phoneNumber: wa_id },
      [RoleTypes.CUSTOMER],
    );
    const conversation =
      await this.conversationService.getOrCreateActiveWhatsappConversation(
        sender.id,
      );

    await this.messageService.createMessage({
      conversationId: conversation.id,
      content: entry,
    });

    const awaitingPickupSession =
      await this.pendingOrderSessionService.findActiveAwaitingPickup(wa_id);
    const awaitingDropOffSession =
      await this.pendingOrderSessionService.findActiveAwaitingDropOff(wa_id);

    if (msgType === "location" && m0?.location) {
      const loc = m0.location as {
        latitude?: number;
        longitude?: number;
        address?: string;
        name?: string;
      };
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const updated =
          await this.pendingOrderSessionService.applyPickupFromSharedLocation({
            waPhone: wa_id,
            latitude: lat,
            longitude: lng,
            address: loc.address ?? null,
            name: loc.name ?? null,
          });
        if (updated) {
          const convId = updated.conversationId || conversation.id;
          await this.conversationService.updateConversation(convId, {
            step: ConversationStep.AWAITING_PUBLIC_DROP_OFF_TEXT,
          });
          await sendMessage({
            phoneNumber: wa_id,
            type: "text",
            message:
              "Thank you. We received your pickup location. Please enter the drop-off address to continue.",
          });
          return true;
        }
      }
    }

    if (msgType === "text" && m0?.text?.body) {
      const body = String(m0.text.body).trim();
      if (awaitingPickupSession) {
        await sendMessage({
          phoneNumber: wa_id,
          type: "text",
          message:
            "Please tap the Send location button so we can capture your pickup coordinates.",
        });
        return true;
      }
      if (awaitingDropOffSession && body.length > 0) {
        await this.completePendingDropOffFromChat({
          waId: wa_id,
          session: awaitingDropOffSession,
          dropoffAddress: body,
          fallbackConversationId: conversation.id,
        });
        return true;
      }
    }

    switch (conversation.step) {
      case ConversationStep.INITIATION:
      case ConversationStep.PENDING_ORDER_TYPE:
        if (awaitingPickupSession) {
          await sendMessage({
            phoneNumber: wa_id,
            type: "text",
            message:
              "Please tap the Send location button so we can capture your pickup coordinates.",
          });
          break;
        }
        await this.sendOrderFlowCta({
          phoneNumber: wa_id,
          conversationId: conversation.id,
          name,
        });

        await this.conversationService.updateConversation(conversation.id, {
          step: ConversationStep.PENDING_ORDER_TYPE,
        });
        break;

      case ConversationStep.PAYMENT_PENDING:
        await sendMessage({
          phoneNumber: wa_id,
          type: "text",
          message:
            "Your order is awaiting payment. Use the link we sent you, or start a new conversation to start over.",
        });
        break;

      case ConversationStep.AWAITING_PUBLIC_DROP_OFF_TEXT:
        await sendMessage({
          phoneNumber: wa_id,
          type: "text",
          message:
            "Please type the drop-off address where the package should be delivered.",
        });
        break;

      default:
        if (process.env.WHATSAPP_FLOW_ID) {
          await this.sendOrderFlowCta({
            phoneNumber: wa_id,
            conversationId: conversation.id,
            name,
          });
        } else {
          await this.orderService.createOrder({
            createdById: sender.id,
            initialFee: DEFAULT_ORDER_FEE,
            type: OrderType.SEND,
            conversationId: conversation.id,
          });
        }
        break;
    }

    return true;
  }

  async handleFlowSubmission(
    decryptedBody: Record<string, any>,
    senderPhone: string,
    flowConversationId: UUID | undefined,
    aesKeyBuffer: Buffer,
    ivBuffer: Buffer,
  ): Promise<string> {
    try {
      const screen = decryptedBody.screen as string | undefined;

      if (!isFlowDataExchangeScreen(screen)) {
        return encryptFlowResponse(
          {
            screen: "PICKUP_METHOD",
            data: {
              error:
                "Unable to process this step. Please restart the order flow.",
            },
          },
          aesKeyBuffer,
          ivBuffer,
        );
      }

      const data = decryptedBody.data || {};

      switch (screen) {
        case "PICKUP_METHOD": {
          const recipient_phone = data.recipient_phone as string | undefined;
          const pickup_method = data.pickup_method as string | undefined;

          if (!recipient_phone || !pickup_method) {
            return encryptFlowResponse(
              {
                screen: "PICKUP_METHOD",
                data: {
                  recipient_phone: recipient_phone ?? "",
                  error: "Please choose how you want to set the pickup location.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          const formattedRecipient = formatPhoneNumber(recipient_phone);
          if (!formattedRecipient) {
            return encryptFlowResponse(
              {
                screen: "PICKUP_METHOD",
                data: {
                  recipient_phone,
                  error: "Please enter a valid Rwandan recipient phone number.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          if (pickup_method === "type_address") {
            return encryptFlowResponse(
              {
                screen: "PICKUP_SEARCH",
                data: { recipient_phone },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          if (pickup_method === "current_location") {
            void sendLocationRequestMessage({
              phoneNumber: senderPhone,
              bodyText:
                "Please share your pickup location so we can assign the nearest rider.",
            }).catch(() => {});

            await this.pendingOrderSessionService.createAwaitingPickupLocation({
              waPhone: senderPhone,
              flowToken: decryptedBody.flow_token,
              conversationId: flowConversationId ?? null,
              recipientPhone: formattedRecipient,
              pickupMethod: pickup_method,
            });

            return encryptFlowResponse(
              {
                screen: "LOCATION_REQUEST_NOTICE",
                data: {},
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          return encryptFlowResponse(
            {
              screen: "PICKUP_METHOD",
              data: {
                recipient_phone,
                error: "Please choose a valid pickup option.",
              },
            },
            aesKeyBuffer,
            ivBuffer,
          );
        }

        case "PICKUP_SEARCH": {
          const recipient_phone = data.recipient_phone as string | undefined;
          const pickup_query = String(data.pickup_query || "").trim();

          if (!recipient_phone || !pickup_query) {
            return encryptFlowResponse(
              {
                screen: "PICKUP_SEARCH",
                data: {
                  recipient_phone: recipient_phone ?? "",
                  error: "Enter a place or landmark to search.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          try {
            const suggestions = await searchLocations({ query: pickup_query });
            if (!suggestions.length) {
              return encryptFlowResponse(
                {
                  screen: "PICKUP_SEARCH",
                  data: {
                    recipient_phone,
                    error:
                      "We could not find that pickup location. Try a nearby landmark, road name, or sector.",
                  },
                },
                aesKeyBuffer,
                ivBuffer,
              );
            }

            const pickupSearchSessionId =
              await this.locationSearchSessionService.saveSuggestions({
                flowToken: decryptedBody.flow_token,
                query: pickup_query,
                suggestions,
              });

            return encryptFlowResponse(
              {
                screen: "PICKUP_RESULTS",
                data: {
                  recipient_phone,
                  pickup_search_session_id: pickupSearchSessionId,
                  pickup_options: suggestions.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description ?? "",
                  })),
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          } catch {
            return encryptFlowResponse(
              {
                screen: "PICKUP_SEARCH",
                data: {
                  recipient_phone,
                  error:
                    "We could not search locations right now. Please try again in a moment.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }
        }

        case "DROPOFF": {
          const recipient_phone = data.recipient_phone as string | undefined;
          const pickup_search_session_id = data.pickup_search_session_id as
            | string
            | undefined;
          const pickup_place_id = data.pickup_place_id as string | undefined;
          const dropoff_address = String(data.dropoff_address || "").trim();

          if (
            !recipient_phone ||
            !pickup_search_session_id ||
            !pickup_place_id ||
            !dropoff_address
          ) {
            return encryptFlowResponse(
              {
                screen: "DROPOFF",
                data: {
                  recipient_phone: recipient_phone ?? "",
                  pickup_search_session_id: pickup_search_session_id ?? "",
                  pickup_place_id: pickup_place_id ?? "",
                  error:
                    "Recipient, pickup selection, and drop-off address are required.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          const formattedRecipient = formatPhoneNumber(recipient_phone);
          if (!formattedRecipient) {
            return encryptFlowResponse(
              {
                screen: "DROPOFF",
                data: {
                  recipient_phone,
                  pickup_search_session_id,
                  pickup_place_id,
                  error: "Please enter a valid Rwandan recipient phone number.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          const pickup =
            await this.locationSearchSessionService.resolveSelectedPickup({
              sessionId: pickup_search_session_id,
              compositePlaceId: pickup_place_id,
            });

          if (!pickup) {
            return encryptFlowResponse(
              {
                screen: "PICKUP_SEARCH",
                data: {
                  recipient_phone,
                  error:
                    "Your pickup search expired. Please search the pickup location again.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }

          const pickupNotes = [pickup.title, pickup.description]
            .filter(Boolean)
            .join(" — ");

          const locationFrom =
            pickup.latitude != null &&
            pickup.longitude != null &&
            Number.isFinite(pickup.latitude) &&
            Number.isFinite(pickup.longitude)
              ? {
                  latitude: pickup.latitude,
                  longitude: pickup.longitude,
                }
              : undefined;

          try {
            const { order } = await this.finalizePublicWhatsappDeliveryOrder({
              senderPhone,
              conversationId: flowConversationId,
              recipientPhoneFormatted: formattedRecipient,
              pickupNotes,
              dropoffDescription: dropoff_address,
              locationFrom,
              pickupProvider: pickup.provider,
              pickupProviderPlaceId: pickup.providerPlaceId,
            });

            return encryptFlowResponse(
              {
                screen: "SUCCESS",
                data: {
                  order_id: order.referenceId || order.id,
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          } catch (error) {
            return encryptFlowResponse(
              {
                screen: "DROPOFF",
                data: {
                  recipient_phone,
                  pickup_search_session_id,
                  pickup_place_id,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Unable to create your order. Please try again.",
                },
              },
              aesKeyBuffer,
              ivBuffer,
            );
          }
        }

        default:
          assertNever(screen);
      }
    } catch (error) {
      return encryptFlowResponse(
        {
          screen: "DROPOFF",
          data: {
            error:
              error instanceof Error
                ? error.message
                : "Unable to create your order. Please try again.",
          },
        },
        aesKeyBuffer,
        ivBuffer,
      );
    }
  }

  private async finalizePublicWhatsappDeliveryOrder(params: {
    senderPhone: string;
    conversationId?: UUID;
    recipientPhoneFormatted: string;
    pickupNotes: string;
    dropoffDescription: string;
    locationFrom?: { latitude: number; longitude: number };
    pickupProvider?: string | null;
    pickupProviderPlaceId?: string | null;
  }): Promise<{ order: Order }> {
    const senderUser = await this.userService.createUser(
      { phoneNumber: params.senderPhone },
      [RoleTypes.CUSTOMER],
    );
    const conversation =
      await this.conversationService.getOrCreateActiveWhatsappConversation(
        senderUser.id,
      );

    const effectiveConversationId = params.conversationId ?? conversation.id;

    const initialAmount = Number(
      process.env.WHATSAPP_ORDER_INITIAL_FEE || DEFAULT_ORDER_FEE,
    );

    const { order } = await this.orderService.createPublicOrder({
      senderPhoneNumber: params.senderPhone,
      recipientPhoneNumber: params.recipientPhoneFormatted,
      initialFee: initialAmount,
      conversationId: effectiveConversationId,
      notes: params.pickupNotes,
      description: params.dropoffDescription,
      locationFrom: params.locationFrom,
      pickupProvider: params.pickupProvider ?? null,
      pickupProviderPlaceId: params.pickupProviderPlaceId ?? null,
      orderSource: "whatsapp_flow",
    });

    const chargedAmount = Number(order.finalFee ?? order.initialFee ?? initialAmount);

    const payment = await this.paymentService.createPayment({
      entityId: order.id,
      amount: chargedAmount,
      currency: KpayCurrency.RWF,
      type: PaymentType.ORDER,
      customerPhone: params.senderPhone,
      customerName: senderUser?.name || "",
      customerEmail: senderUser?.email || "",
      createdById: order.senderId,
      provider: PaymentProvider.URUBUTO,
      metadata: {
        source: "whatsapp_flow",
        conversationId: effectiveConversationId,
        orderId: order.id,
      },
    });

    const paymentUrl = payment.paymentUrl || payment.metadata?.paymentUrl;

    if (paymentUrl) {
      sendCtaUrlButton({
        phoneNumber: params.senderPhone,
        displayText: `Pay ${chargedAmount.toLocaleString()} RWF`,
        url: paymentUrl,
        bodyText: paymentCTABodyText(order.referenceId, chargedAmount),
        footerText: "Payment link expires in 5 hours",
      }).catch(() => {});
    } else {
      sendMessage({
        phoneNumber: params.senderPhone,
        type: "text",
        message:
          "Your order was created, but we could not generate a payment link. Our team will contact you shortly.",
      }).catch(() => {});
    }

    await this.conversationService.updateConversation(effectiveConversationId, {
      step: ConversationStep.PAYMENT_PENDING,
    });

    return { order };
  }

  private async completePendingDropOffFromChat(params: {
    waId: string;
    session: PendingOrderSession;
    dropoffAddress: string;
    fallbackConversationId: UUID;
  }) {
    const formattedRecipient = formatPhoneNumber(params.session.recipientPhone);
    if (!formattedRecipient) {
      await sendMessage({
        phoneNumber: params.waId,
        type: "text",
        message:
          "We could not read the recipient phone from your order. Please start a new delivery request.",
      });
      return;
    }

    const lat = params.session.pickupLatitude;
    const lng = params.session.pickupLongitude;
    const locationFrom =
      lat != null &&
      lng != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
        ? { latitude: lat, longitude: lng }
        : undefined;

    const pickupNotes =
      params.session.pickupName ||
      params.session.pickupAddress ||
      (locationFrom
        ? `Shared pin (${locationFrom.latitude.toFixed(5)}, ${locationFrom.longitude.toFixed(5)})`
        : "Shared pickup location");

    const conversationId =
      params.session.conversationId ?? params.fallbackConversationId;

    try {
      await this.finalizePublicWhatsappDeliveryOrder({
        senderPhone: params.waId,
        conversationId,
        recipientPhoneFormatted: formattedRecipient,
        pickupNotes,
        dropoffDescription: params.dropoffAddress,
        locationFrom,
        pickupProvider: null,
        pickupProviderPlaceId: null,
      });
      await this.pendingOrderSessionService.markCompleted(params.session.id);
    } catch {
      await sendMessage({
        phoneNumber: params.waId,
        type: "text",
        message:
          "We could not place your order right now. Please try again shortly.",
      });
    }
  }

  private async sendOrderFlowCta({
    phoneNumber,
    conversationId,
    name,
  }: {
    phoneNumber: string;
    conversationId: string;
    name?: string;
  }) {
    const flowId = process.env.WHATSAPP_FLOW_ID;
    const flowTokenSecret = process.env.WHATSAPP_FLOW_TOKEN_SECRET;

    if (!flowId || !flowTokenSecret) {
      await sendMessage({
        phoneNumber,
        type: "text",
        message:
          "Welcome to Peekaboo! WhatsApp ordering is temporarily unavailable. Please try again later.",
      });
      return;
    }

    const flowToken = jwt.sign(
      { phone: phoneNumber, conversationId },
      flowTokenSecret,
      { expiresIn: "24h" },
    );

    await sendFlowMessage({
      phoneNumber,
      flowId,
      flowToken,
      bodyText: flowCTABodyText(name),
    });
  }
}
