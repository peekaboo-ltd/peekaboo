import cron from 'node-cron';
import logger from '../helpers/logger.helper';
import { pushService } from '../services/push.service';

export function startPushReceiptCronJobs(): void {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running push receipt reconciliation cron job...');

    try {
      await pushService.processReceipts();
    } catch (error) {
      logger.error('Push receipt reconciliation failed:', error);
    }
  });

  logger.info('Push receipt cron jobs scheduled');
}
