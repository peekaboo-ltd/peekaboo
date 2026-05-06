import cron from 'node-cron';
import logger from '../helpers/logger.helper';
import { PaymentService } from '../services/payment.service';

export function startWhatsappPaymentSessionCronJobs(): void {
  cron.schedule('*/10 * * * *', async () => {
    logger.info('Running WhatsApp payment-session expiry cron job...');

    try {
      const paymentService = new PaymentService();
      const expiredCount = await paymentService.expireStaleWhatsappPaymentSessions();

      if (expiredCount > 0) {
        logger.info(
          `WhatsApp payment-session expiry complete: ${expiredCount} session(s) expired`,
        );
      }
    } catch (error) {
      logger.error('WhatsApp payment-session expiry cron job failed:', error);
    }
  });

  logger.info('WhatsApp payment-session expiry cron job scheduled');
}
