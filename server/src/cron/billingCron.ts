import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { OrganizationBilling } from '../entities/organizationBilling.entity';
import { Organization } from '../entities/organization.entity';
import { BillingStatus, OrganizationStatus } from '../constants/organization.constants';
import { EmailService } from '../integrations/emails/email.service';
import { generateReferenceNumber } from '../helpers/string.helper';
import { LessThan } from 'typeorm';
import logger from '../helpers/logger.helper';

const emailService = new EmailService();

/**
 * Auto-generate invoices for completed billing periods.
 * Runs daily at midnight.
 */
async function autoGenerateInvoices(): Promise<void> {
  const billingRepository = AppDataSource.getRepository(OrganizationBilling);
  const now = new Date();

  // Find all PENDING billing periods that have ended
  const pendingBillings = await billingRepository.find({
    where: {
      status: BillingStatus.PENDING,
      periodEnd: LessThan(now),
    },
    relations: { organization: true },
  });

  for (const billing of pendingBillings) {
    // Skip billing periods with no orders
    if (billing.totalOrders === 0) {
      continue;
    }

    // Generate unique invoice number
    let invoiceNumber = generateReferenceNumber({ prefix: 'INV', length: 8 });
    while (await billingRepository.findOne({ where: { invoiceNumber } })) {
      invoiceNumber = generateReferenceNumber({ prefix: 'INV', length: 8 });
    }

    const paymentTermsDays = billing.organization?.paymentTermsDays || billing.paymentTermsDays || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);

    billing.invoiceNumber = invoiceNumber;
    billing.status = BillingStatus.INVOICED;
    billing.invoicedAt = new Date();
    billing.dueDate = dueDate;
    billing.paymentTermsDays = paymentTermsDays;

    await billingRepository.save(billing);

    // Send invoice email
    if (billing.organization?.email) {
      emailService
        .sendInvoiceGeneratedEmail({
          organizationName: billing.organization.name,
          adminEmail: billing.organization.email,
          invoiceNumber,
          periodStart: billing.periodStart,
          periodEnd: billing.periodEnd,
          totalAmount: Number(billing.totalAmount),
          currency: billing.currency || 'RWF',
          totalOrders: billing.totalOrders,
        })
        .catch(() => {});
    }

    logger.info(`Auto-generated invoice ${invoiceNumber} for org ${billing.organizationId}`);
  }

  if (pendingBillings.length > 0) {
    logger.info(`Auto-invoicing complete: ${pendingBillings.length} billing period(s) processed`);
  }
}

/**
 * Mark overdue invoices and send notification emails.
 * Runs daily at 6 AM.
 */
async function markOverdueInvoices(): Promise<void> {
  const billingRepository = AppDataSource.getRepository(OrganizationBilling);
  const now = new Date();

  // Find all INVOICED billings whose due date has passed
  const overdueBillings = await billingRepository.find({
    where: {
      status: BillingStatus.INVOICED,
      dueDate: LessThan(now),
    },
    relations: { organization: true },
  });

  for (const billing of overdueBillings) {
    billing.status = BillingStatus.OVERDUE;
    await billingRepository.save(billing);

    // Calculate days overdue
    const daysOverdue = Math.floor(
      (now.getTime() - (billing.dueDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)
    );

    // Send overdue notification email
    if (billing.organization?.email && billing.invoiceNumber && billing.dueDate) {
      emailService
        .sendPaymentOverdueEmail({
          organizationName: billing.organization.name,
          adminEmail: billing.organization.email,
          invoiceNumber: billing.invoiceNumber,
          amount: Number(billing.totalAmount),
          currency: billing.currency || 'RWF',
          dueDate: billing.dueDate,
          daysOverdue,
        })
        .catch(() => {});
    }

    logger.info(`Marked billing ${billing.id} as overdue (invoice ${billing.invoiceNumber})`);
  }

  if (overdueBillings.length > 0) {
    logger.info(`Overdue check complete: ${overdueBillings.length} billing(s) marked overdue`);
  }
}

/**
 * Send monthly billing summary to each active organization.
 * Runs on the 1st of each month at 8 AM.
 */
async function sendMonthlySummaries(): Promise<void> {
  const billingRepository = AppDataSource.getRepository(OrganizationBilling);
  const organizationRepository = AppDataSource.getRepository(Organization);

  // Get the previous month's date range
  const now = new Date();
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const monthName = previousMonthStart.toLocaleString('en-US', { month: 'long' });
  const year = previousMonthStart.getFullYear();

  // Get all active organizations with email
  const organizations = await organizationRepository.find({
    where: { status: OrganizationStatus.ACTIVE },
  });

  for (const org of organizations) {
    if (!org.email) continue;

    // Get billing records for the previous month
    const billings = await billingRepository
      .createQueryBuilder('billing')
      .where('billing.organizationId = :orgId', { orgId: org.id })
      .andWhere('billing.periodStart >= :start', { start: previousMonthStart })
      .andWhere('billing.periodEnd <= :end', { end: previousMonthEnd })
      .getMany();

    const totalOrders = billings.reduce((sum, b) => sum + b.totalOrders, 0);
    const totalAmount = billings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

    // Only send if there was activity
    if (totalOrders === 0) continue;

    emailService
      .sendMonthlyBillingSummaryEmail({
        organizationName: org.name,
        adminEmail: org.email,
        month: monthName,
        year,
        totalOrders,
        totalAmount,
        currency: 'RWF',
      })
      .catch(() => {});

    logger.info(`Sent monthly summary to ${org.name} (${org.email})`);
  }
}

/**
 * Start all billing cron jobs.
 * Should be called once from the primary process.
 */
export function startBillingCronJobs(): void {
  // Auto-generate invoices — daily at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running auto-invoice generation cron job...');
    try {
      await autoGenerateInvoices();
    } catch (error) {
      logger.error('Auto-invoice cron job failed:', error);
    }
  });

  // Mark overdue invoices — daily at 6 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running overdue invoice detection cron job...');
    try {
      await markOverdueInvoices();
    } catch (error) {
      logger.error('Overdue detection cron job failed:', error);
    }
  });

  // Monthly billing summaries — 1st of each month at 8 AM
  cron.schedule('0 8 1 * *', async () => {
    logger.info('Running monthly billing summary cron job...');
    try {
      await sendMonthlySummaries();
    } catch (error) {
      logger.error('Monthly summary cron job failed:', error);
    }
  });

  logger.info('Billing cron jobs scheduled');
}
