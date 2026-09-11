import cron from "node-cron";
import { AppDataSource } from "../data-source";
import { OrderActivityStatus, OrderStatus } from "../constants/order.constants";
import { PendingOrderSessionStatus } from "../constants/pendingOrderSession.constants";
import { Order } from "../entities/order.entity";
import { OrderActivity } from "../entities/orderActivity.entity";
import { Payment } from "../entities/payment.entity";
import { PendingOrderSession } from "../entities/pendingOrderSession.entity";
import { PaymentStatus } from "../types/payment-status.types";
import { PendingOrderSessionService } from "../services/pendingOrderSession.service";
import { WhatsappNotificationService } from "../services/whatsappNotification.service";
import logger from "../helpers/logger.helper";

export async function expireStaleWhatsappSessions(): Promise<void> {
  const sessions = await new PendingOrderSessionService().findExpiredActive();
  const notifier = new WhatsappNotificationService();

  for (const candidate of sessions) {
    const expired = await AppDataSource.transaction(async (manager) => {
      const session = await manager.getRepository(PendingOrderSession).findOne({
        where: { id: candidate.id },
        lock: { mode: "pessimistic_write" },
      });
      if (
        !session ||
        session.expiresAt.getTime() > Date.now() ||
        [
          PendingOrderSessionStatus.PAID,
          PendingOrderSessionStatus.DECLINED,
          PendingOrderSessionStatus.EXPIRED,
          PendingOrderSessionStatus.CANCELLED,
          PendingOrderSessionStatus.COMPLETED,
        ].includes(session.status)
      ) return null;

      const payment = session.paymentId
        ? await manager.getRepository(Payment).findOne({
            where: { id: session.paymentId },
            lock: { mode: "pessimistic_write" },
          })
        : null;
      if (payment?.status === PaymentStatus.SUCCESSFUL) {
        session.status = PendingOrderSessionStatus.PAID;
        return manager.getRepository(PendingOrderSession).save(session).then(() => null);
      }

      if (session.orderId) {
        const order = await manager.getRepository(Order).findOne({
          where: { id: session.orderId },
          lock: { mode: "pessimistic_write" },
        });
        if (order && ![OrderStatus.PAID, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status)) {
          order.status = OrderStatus.CANCELLED;
          await manager.getRepository(Order).save(order);
          const activity = await manager.getRepository(OrderActivity).findOne({
            where: { orderId: order.id, status: OrderActivityStatus.CANCELLED },
          });
          if (!activity) {
            await manager.getRepository(OrderActivity).save({
              orderId: order.id,
              status: OrderActivityStatus.CANCELLED,
              createdById: order.createdById,
              notes: "WhatsApp recipient or quote/payment deadline expired",
            });
          }
        }
      }
      session.status = PendingOrderSessionStatus.EXPIRED;
      session.terminalReason = "Five-hour WhatsApp booking deadline expired";
      await manager.getRepository(PendingOrderSession).save(session);
      return session;
    });

    if (expired) {
      notifier.notifyBookingExpired(expired).catch((error) =>
        logger.error("Failed to send WhatsApp booking expiry notification", error),
      );
    }
  }
}

export function startWhatsappSessionCronJob(): void {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await expireStaleWhatsappSessions();
    } catch (error) {
      logger.error("WhatsApp session expiry cron failed:", error);
    }
  });
}
