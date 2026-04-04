import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { RoleTypes } from '../constants/role.constants';
import { UserStatus } from '../constants/user.constants';
import { DashboardService } from '../services/dashboard.service';
import { EmailService } from '../integrations/emails/email.service';
import logger from '../helpers/logger.helper';

const dashboardService = new DashboardService();
const emailService = new EmailService();

async function sendMonthlyBusinessReports(): Promise<void> {
  const userRepository = AppDataSource.getRepository(User);

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const businessUsers = await userRepository
    .createQueryBuilder('user')
    .innerJoin('user.userRoles', 'userRole')
    .innerJoin('userRole.role', 'role')
    .where('role.name = :roleName', { roleName: RoleTypes.BUSINESS })
    .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
    .andWhere('user.email IS NOT NULL')
    .getMany();

  for (const user of businessUsers) {
    if (!user.email) continue;

    const report = await dashboardService.getBusinessReport(
      {
        requesterUserId: user.id,
        requesterRoles: [RoleTypes.BUSINESS],
      },
      periodStart,
      periodEnd,
    );
    if (report.summary.totalOrders === 0 && report.summary.totalRevenue === 0) {
      continue;
    }

    const html = dashboardService.buildBusinessReportHtml(report);
    await emailService.sendBusinessReportEmail({
      to: user.email,
      name: user.name || 'Business User',
      html,
      periodStart,
      periodEnd,
    });

    logger.info(`Monthly business report sent to ${user.email}`);
  }
}

export function startBusinessReportCronJobs(): void {
  // 1st of every month at 9 AM
  cron.schedule('0 9 1 * *', async () => {
    logger.info('Running monthly business report cron job...');
    try {
      await sendMonthlyBusinessReports();
    } catch (error) {
      logger.error('Monthly business report cron job failed:', error);
    }
  });

  logger.info('Business report cron job scheduled');
}
