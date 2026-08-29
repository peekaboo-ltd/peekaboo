import { AppDataSource } from "../data-source";
import { Conversation } from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { Order } from "../entities/order.entity";
import { Payment } from "../entities/payment.entity";
import { PendingOrderSession } from "../entities/pendingOrderSession.entity";
import { MessageDirection, WhatsAppMessageStatus } from "../constants/message.constants";
import { OrderPayerType } from "../constants/order.constants";
import { sendMessage, sendUtilityTemplate } from "../helpers/whatsapp.helper";
import logger from "../helpers/logger.helper";
import { UUID } from "../types";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";

const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

export class WhatsappNotificationService {
  async notifyBookingExpired(session: PendingOrderSession): Promise<void> {
    if (!session.conversationId) return;
    await this.sendUpdate({
      phone: session.waPhone,
      conversationId: session.conversationId,
      text: "This personal-delivery booking expired and was cancelled. Send a new message to restart.",
      templateName: process.env.WHATSAPP_BOOKING_EXPIRED_TEMPLATE || "booking_expired",
      templateParameters: [],
    });
  }

  async notifyOrderPaid(payment: Payment): Promise<void> {
    if (payment.metadata?.whatsappPaidNotifiedAt) return;
    const order = await AppDataSource.getRepository(Order).findOne({
      where: { id: payment.entityId },
      relations: { sender: true, recipient: true },
    });
    if (!order || order.orderSource !== "whatsapp_personal") return;
    const session = await AppDataSource.getRepository(PendingOrderSession).findOne({
      where: { orderId: order.id },
    });
    if (!session) return;
    const payerIsSender = order.payerType === OrderPayerType.SENDER;
    const phone = payerIsSender ? session.waPhone : session.recipientPhone;
    const conversationId = payerIsSender
      ? session.conversationId
      : session.recipientConversationId;
    if (!conversationId) return;

    await this.sendUpdate({
      phone,
      conversationId,
      text: `Payment received for order ${order.referenceId}. A rider will be assigned shortly.`,
      templateName: process.env.WHATSAPP_ORDER_PAID_TEMPLATE || "order_paid",
      templateParameters: [order.referenceId],
    });
    payment.metadata = {
      ...(payment.metadata || {}),
      whatsappPaidNotifiedAt: new Date().toISOString(),
    };
    await AppDataSource.getRepository(Payment).update(payment.id, {
      metadata: payment.metadata,
    });
  }

  async notifyOrderDelivered(orderId: UUID): Promise<void> {
    const order = await AppDataSource.getRepository(Order).findOne({
      where: { id: orderId },
    });
    if (!order || order.orderSource !== "whatsapp_personal") return;
    const session = await AppDataSource.getRepository(PendingOrderSession).findOne({
      where: { orderId },
    });
    if (!session || session.metadataJson?.deliveredNotifiedAt) return;

    const targets = [
      { phone: session.waPhone, conversationId: session.conversationId },
      { phone: session.recipientPhone, conversationId: session.recipientConversationId },
    ].filter((target): target is { phone: string; conversationId: UUID } => Boolean(target.conversationId));

    await Promise.all(targets.map((target) => this.sendUpdate({
      ...target,
      text: `Order ${order.referenceId} has been delivered. Thank you for using Peekaboo.`,
      templateName: process.env.WHATSAPP_ORDER_DELIVERED_TEMPLATE || "order_delivered",
      templateParameters: [order.referenceId],
    })));
    session.metadataJson = {
      ...(session.metadataJson || {}),
      deliveredNotifiedAt: new Date().toISOString(),
    };
    session.status = PendingOrderSessionStatus.COMPLETED;
    await AppDataSource.getRepository(PendingOrderSession).save(session);
  }

  async notifyLatePayment(payment: Payment): Promise<void> {
    const conversationId = payment.metadata?.conversationId as UUID | undefined;
    if (!conversationId || !payment.customerPhone) return;
    await this.sendUpdate({
      phone: payment.customerPhone,
      conversationId,
      text: "We received payment after this booking was cancelled. It will not dispatch a rider; our team will reconcile or refund it.",
      templateName: process.env.WHATSAPP_LATE_PAYMENT_TEMPLATE || "late_order_payment",
      templateParameters: [],
    });
  }

  private async sendUpdate(params: {
    phone: string;
    conversationId: UUID;
    text: string;
    templateName: string;
    templateParameters: string[];
  }): Promise<void> {
    const conversation = await AppDataSource.getRepository(Conversation).findOne({
      where: { id: params.conversationId },
    });
    const insideWindow = Boolean(
      conversation?.lastCustomerMessageAt &&
      Date.now() - conversation.lastCustomerMessageAt.getTime() < SERVICE_WINDOW_MS,
    );
    try {
      const response = insideWindow
        ? await sendMessage({ phoneNumber: params.phone, type: "text", message: params.text })
        : await sendUtilityTemplate({
            phoneNumber: params.phone,
            templateName: params.templateName,
            components: params.templateParameters.length
              ? [{
                  type: "body",
                  parameters: params.templateParameters.map((text) => ({ type: "text", text })),
                }]
              : [],
          });
      await AppDataSource.getRepository(Message).save({
        conversationId: params.conversationId,
        externalMessageId: response?.data?.messages?.[0]?.id,
        content: { kind: "order_update", text: params.text, templateName: insideWindow ? null : params.templateName },
        direction: MessageDirection.OUTBOUND,
        deliveryStatus: WhatsAppMessageStatus.SENT,
      });
    } catch (error) {
      logger.error("Failed to send WhatsApp order update", error);
      throw error;
    }
  }
}
