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

const DEFAULT_ORDER_FEE = 1500;

export class WhatsappService {
  private readonly conversationService: ConversationService;
  private readonly messageService: MessageService;
  private readonly userService: UserService;
  private readonly orderService: OrderService;
  private readonly paymentService: PaymentService;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
    this.userService = new UserService();
    this.orderService = new OrderService();
    this.paymentService = new PaymentService();
  }

  async handleMessage(message: Record<string, any>) {
    const { entry } = message;
    const { value } = entry[0].changes[0];
    const { contacts, messages } = value;

    if (!contacts || !messages) {
      return false;
    }

    if (!messages[0]?.text && !messages[0]?.interactive && !messages[0]?.location) {
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

    switch (conversation.step) {
      case ConversationStep.INITIATION:
      case ConversationStep.PENDING_ORDER_TYPE:
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
    aesKeyBuffer: Buffer,
    ivBuffer: Buffer,
  ): Promise<string> {
    try {
      const { recipient_phone, pickup_address, dropoff_address } =
        decryptedBody.data || {};

      if (!recipient_phone || !pickup_address || !dropoff_address) {
        return encryptFlowResponse(
          {
            screen: "DROPOFF",
            data: {
              error:
                "Recipient phone, pickup address, and drop-off address are required.",
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
              error: "Please enter a valid Rwandan recipient phone number.",
            },
          },
          aesKeyBuffer,
          ivBuffer,
        );
      }

      const senderUser = await this.userService.createUser(
        { phoneNumber: senderPhone },
        [RoleTypes.CUSTOMER],
      );
      const conversation =
        await this.conversationService.getOrCreateActiveWhatsappConversation(
          senderUser.id,
        );
      const amount = Number(process.env.WHATSAPP_ORDER_INITIAL_FEE || DEFAULT_ORDER_FEE);
      const { order } = await this.orderService.createPublicOrder({
        senderPhoneNumber: senderPhone,
        recipientPhoneNumber: formattedRecipient,
        initialFee: amount,
      });

      await this.orderService.updateOrder(
        order.id,
        {
          conversationId: conversation.id,
          notes: pickup_address,
          description: dropoff_address,
        },
        { createdById: order.senderId },
      );

      const payment = await this.paymentService.createPayment({
        entityId: order.id,
        amount,
        currency: KpayCurrency.RWF,
        type: PaymentType.ORDER,
        customerPhone: senderPhone,
        customerName: senderUser?.name || "",
        customerEmail: senderUser?.email || "",
        createdById: order.senderId,
        provider: PaymentProvider.URUBUTO,
        metadata: {
          source: "whatsapp_flow",
          conversationId: conversation.id,
          orderId: order.id,
        },
      });

      const paymentUrl = payment.paymentUrl || payment.metadata?.paymentUrl;

      if (paymentUrl) {
        sendCtaUrlButton({
          phoneNumber: senderPhone,
          displayText: `Pay ${amount.toLocaleString()} RWF`,
          url: paymentUrl,
          bodyText: paymentCTABodyText(order.referenceId, amount),
          footerText: "Payment link expires in 5 hours",
        }).catch(() => {});
      } else {
        sendMessage({
          phoneNumber: senderPhone,
          type: "text",
          message:
            "Your order was created, but we could not generate a payment link. Our team will contact you shortly.",
        }).catch(() => {});
      }

      await this.conversationService.updateConversation(conversation.id, {
        step: ConversationStep.PAYMENT_PENDING,
      });

      return encryptFlowResponse(
        { screen: "SUCCESS", data: {} },
        aesKeyBuffer,
        ivBuffer,
      );
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
