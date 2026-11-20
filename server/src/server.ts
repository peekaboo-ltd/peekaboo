import cluster from "cluster";
import os from "os";
import logger from "./helpers/logger.helper";
import { AppDataSource } from "./data-source";
import { startBillingCronJobs } from "./cron/billingCron";
import { startBusinessReportCronJobs } from "./cron/businessReportCron";
import { startWhatsappSessionCronJob } from "./cron/whatsappSessionCron";
import { startPaymentReconcileCronJob } from "./cron/paymentReconcileCron";

// os.cpus() reports the host machine's cores, not the container's quota, so
// on platforms like Render it can fork dozens of workers and blow the memory
// limit. Default to one worker; raise WEB_CONCURRENCY when the plan allows.
const numCPUs = Math.max(
  1,
  Math.min(Number(process.env.WEB_CONCURRENCY) || 1, os.cpus().length)
);

if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running`);

  // Start cron jobs on the primary process to avoid duplicate execution
  AppDataSource.initialize()
    .then(() => {
      logger.info('Primary process database connected — starting cron jobs');
      startBillingCronJobs();
      startBusinessReportCronJobs();
      startWhatsappSessionCronJob();
      startPaymentReconcileCronJob();
    })
    .catch((error) => {
      logger.error('Primary process database connection failed, cron jobs will not start', error);
    });

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died with code ${code}`);
    // Back off before replacing a crashed worker so a persistent
    // failure (e.g. database down) does not hot-loop forks.
    const delayMs = code === 0 ? 0 : 5000;
    setTimeout(() => cluster.fork(), delayMs);
  });
} else {
  import("./app")
    .then(({ default: app, databaseReady }) => {
      const { PORT = 8080 } = process.env;
      return databaseReady.then(
        () => {
          app.listen(PORT, () => {
            logger.success(
              `Worker ${process.pid} started on port ${PORT}`
            );
          });
        },
        (error: unknown) => {
          logger.error(
            `Worker ${process.pid} failed to connect to database, exiting`,
            error
          );
          process.exit(1);
        }
      );
    })
    .catch((error) => {
      logger.error(`Worker ${process.pid} failed to start`, error);
      process.exit(1);
    });
}
