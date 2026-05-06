import cron from 'node-cron';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source';
import {
  ConversationStatus,
  ConversationStep,
} from '../constants/conversation.constants';
import {
  OrderActivityStatus,
  OrderStatus,
} from '../constants/order.constants';
import { Conversation } from '../entities/conversation.entity';
import { Order } from '../entities/order.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { sendMessage } from '../helpers/whatsapp.helper';
import logger from '../helpers/logger.helper';
import { sessionExpiredTemplate } from '../templates/whatsapp/whatsapp.template';

export async function expireStaleWhatsappSessions(): Promise<void> {
  const conversationRepository = AppDataSource.getRepository(Conversation);
  const orderRepository = AppDataSource.getRepository(Order);
  const orderActivityRepository = AppDataSource.getRepository(OrderActivity);
  const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

  const staleConversations = await conversationRepository.find({
    where: {
      status: ConversationStatus.ACTIVE,
      step: ConversationStep.PAYMENT_PENDING,
      updatedAt: LessThan(fiveHoursAgo),
    },
    relations: ["recipient"],
  });

  for (const conversation of staleConversations) {
    await conversationRepository.update(conversation.id, {
      status: ConversationStatus.EXPIRED,
    });

    const orders = await orderRepository.find({
      where: { conversationId: conversation.id },
    });

    for (const order of orders) {
      const paidActivity = await orderActivityRepository.findOne({
        where: { orderId: order.id, status: OrderActivityStatus.PAID },
      });

      if (!paidActivity) {
        await orderActivityRepository.save({
          orderId: order.id,
          status: OrderActivityStatus.CANCELLED,
          createdById: order.createdById,
          notes: "Session expired — payment not completed within 5 hours",
        });
        await orderRepository.update(order.id, {
          status: OrderStatus.CANCELLED,
        });
      }
    }

    if (conversation.recipient?.phoneNumber) {
      sendMessage({
        phoneNumber: conversation.recipient.phoneNumber,
        type: "text",
        message: sessionExpiredTemplate(),
      }).catch(() => {});
    }
  }
}

export function startWhatsappSessionCronJob(): void {
  cron.schedule("*/30 * * * *", async () => {
    try {
      await expireStaleWhatsappSessions();
    } catch (error) {
      logger.error("WhatsApp session expiry cron failed:", error);
    }
  });
}
