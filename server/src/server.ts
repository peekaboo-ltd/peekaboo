import cluster from "cluster";
import os from "os";
import logger from "./helpers/logger.helper";
import { AppDataSource } from "./data-source";
import { startBillingCronJobs } from "./cron/billingCron";
import { startBusinessReportCronJobs } from "./cron/businessReportCron";
import { startWhatsappSessionCronJob } from "./cron/whatsappSessionCron";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running`);

  // Start cron jobs on the primary process to avoid duplicate execution
  AppDataSource.initialize()
    .then(() => {
      logger.info('Primary process database connected — starting cron jobs');
      startBillingCronJobs();
      startBusinessReportCronJobs();
      startWhatsappSessionCronJob();
    })
    .catch((error) => {
      logger.error('Primary process database connection failed, cron jobs will not start', error);
    });

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  import("./app").then(({ default: app }) => {
    const { PORT = 8080, DB_NAME } = process.env;
    app.listen(PORT, () => {
      logger.success(
        `Worker ${process.pid} started on port ${PORT}`
      );
    });
  });
}
