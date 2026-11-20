import cron from "node-cron";
import { PaymentService } from "../services/payment.service";
import { UUID } from "../types";
import logger from "../helpers/logger.helper";

let running = false;

// MVend callbacks are undocumented and unsigned, so they are never the only
// path to a final status: this job polls gettransactionstatus for PENDING
// MVend payments. Runs on the cluster primary only (see server.ts).
export async function reconcilePendingMvendPayments(
  paymentService: PaymentService = new PaymentService(),
): Promise<void> {
  if (running) return;
  running = true;
  try {
    const pending = await paymentService.findPendingMvendPayments();
    for (const payment of pending) {
      try {
        const { outcome, payment: updated } =
          await paymentService.refreshPaymentStatusFromProvider(payment.id as UUID, "cron");
        if (outcome === "updated") {
          logger.info("MVend payment reconciled", {
            paymentId: payment.id,
            status: updated.status,
          });
        }
      } catch (error: any) {
        logger.error("MVend payment reconciliation failed", {
          paymentId: payment.id,
          message: error?.message,
        });
      }
    }
  } finally {
    running = false;
  }
}

export function startPaymentReconcileCronJob(): void {
  cron.schedule("*/2 * * * *", async () => {
    try {
      await reconcilePendingMvendPayments();
    } catch (error) {
      logger.error("Payment reconciliation cron failed:", error);
    }
  });
}
