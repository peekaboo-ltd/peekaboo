import { FindOptionsWhere, Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrganizationBilling } from '../entities/organizationBilling.entity';
import { BillingStatus, BillingPeriod, OrganizationStatus } from '../constants/organization.constants';
import { UUID } from '../types';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { Order } from '../entities/order.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { OrderStatus } from '../constants/order.constants';
import { generateReferenceNumber } from '../helpers/string.helper';
import { BillingQuery, GlobalBillingSummary } from '../types/b2b.types';
import { Organization } from '../entities/organization.entity';
import { EmailService } from '../integrations/emails/email.service';
import { AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';

export class OrganizationBillingService {
  private readonly billingRepository: Repository<OrganizationBilling>;
  private readonly orderRepository: Repository<Order>;
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly organizationRepository: Repository<Organization>;
  private readonly emailService: EmailService;

  constructor() {
    this.billingRepository = AppDataSource.getRepository(OrganizationBilling);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderActivityRepository = AppDataSource.getRepository(OrderActivity);
    this.organizationRepository = AppDataSource.getRepository(Organization);
    this.emailService = new EmailService();
  }

  // GET OR CREATE CURRENT BILLING PERIOD
  async getOrCreateCurrentBillingPeriod(
    organizationId: UUID,
    billingPeriod: BillingPeriod = BillingPeriod.MONTHLY
  ): Promise<OrganizationBilling> {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (billingPeriod === BillingPeriod.MONTHLY) {
      // Start of current month
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      // End of current month
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Weekly billing - start of week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      periodStart = new Date(now.getFullYear(), now.getMonth(), diff);
      periodStart.setHours(0, 0, 0, 0);
      // End of week (Sunday)
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59);
    }

    // Check if billing period exists
    const billing = await this.billingRepository.findOne({
      where: {
        organizationId,
        periodStart: LessThanOrEqual(now),
        periodEnd: MoreThanOrEqual(now),
      },
    });

    if (billing) {
      return billing;
    }

    // Create new billing period
    const newBilling = await this.billingRepository.save({
      organizationId,
      billingPeriod,
      periodStart,
      periodEnd,
      totalOrders: 0,
      totalAmount: 0,
      currency: 'RWF',
      status: BillingStatus.PENDING,
    });

    return newBilling;
  }

  // ADD ORDER TO BILLING
  async addOrderToBilling(orderId: UUID, orderAmount: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { organization: true },
    });

    if (!order || !order.organizationId) {
      return; // Not a business order
    }

    // Read the organization's configured billing period
    const organization = await this.organizationRepository.findOne({
      where: { id: order.organizationId },
    });

    const billingPeriod = organization?.billingPeriod || BillingPeriod.MONTHLY;

    // Get or create current billing period
    const billing = await this.getOrCreateCurrentBillingPeriod(
      order.organizationId,
      billingPeriod
    );

    // Atomic increment to prevent race conditions
    await this.billingRepository
      .createQueryBuilder()
      .update(OrganizationBilling)
      .set({
        totalOrders: () => 'total_orders + 1',
        totalAmount: () => `total_amount + ${Number(orderAmount)}`,
      })
      .where('id = :id', { id: billing.id })
      .execute();

    // Link order to billing
    order.organizationBillingId = billing.id;
    await this.orderRepository.save(order);
  }

  // REMOVE ORDER FROM BILLING (on cancellation)
  async removeOrderFromBilling(orderId: UUID, orderAmount: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order || !order.organizationBillingId) {
      return; // Not linked to any billing period
    }

    const billing = await this.billingRepository.findOne({
      where: { id: order.organizationBillingId },
    });

    if (!billing || billing.status !== BillingStatus.PENDING) {
      return; // Only adjust billing that hasn't been invoiced yet
    }

    // Atomic decrement to prevent race conditions
    await this.billingRepository
      .createQueryBuilder()
      .update(OrganizationBilling)
      .set({
        totalOrders: () => 'GREATEST(total_orders - 1, 0)',
        totalAmount: () => `GREATEST(total_amount - ${Number(orderAmount)}, 0)`,
      })
      .where('id = :id', { id: billing.id })
      .execute();

    // Unlink order from billing
    order.organizationBillingId = undefined;
    await this.orderRepository.save(order);
  }

  // GET BILLING BY ID
  async getBillingById(id: UUID): Promise<OrganizationBilling> {
    const billing = await this.billingRepository.findOne({
      where: { id },
      relations: {
        organization: true,
        orders: true,
        createdBy: true,
      },
    });

    if (!billing) {
      throw new NotFoundError('Billing record not found');
    }

    return billing;
  }

  // Alias for audit decorators
  async getEntityById(id: UUID): Promise<OrganizationBilling> {
    return this.getBillingById(id);
  }

  // GENERATE INVOICE
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORGANIZATION_BILLING,
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1],
  })
  async generateInvoice(
    billingId: UUID,
    createdById: UUID
  ): Promise<OrganizationBilling> {
    const billing = await this.getBillingById(billingId);

    if (billing.status === BillingStatus.INVOICED || billing.status === BillingStatus.PAID) {
      throw new ValidationError('Invoice already generated for this billing period');
    }

    // Generate invoice number
    let invoiceNumber = generateReferenceNumber({
      prefix: 'INV',
      length: 8,
    });

    // Ensure uniqueness
    while (
      await this.billingRepository.findOne({ where: { invoiceNumber } })
    ) {
      invoiceNumber = generateReferenceNumber({
        prefix: 'INV',
        length: 8,
      });
    }

    billing.invoiceNumber = invoiceNumber;
    billing.status = BillingStatus.INVOICED;
    billing.invoicedAt = new Date();
    billing.createdById = createdById;

    // Set due date based on organization's payment terms
    const paymentTermsDays = billing.organization?.paymentTermsDays || billing.paymentTermsDays || 30;
    billing.paymentTermsDays = paymentTermsDays;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);
    billing.dueDate = dueDate;

    const savedBilling = await this.billingRepository.save(billing);

    // Send invoice generated email (non-blocking)
    if (billing.organization?.email) {
      this.emailService
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

    return savedBilling;
  }

  // MARK AS PAID
  @AuditUpdate({
    entityType: AuditLogEntityTypes.ORGANIZATION_BILLING,
    getEntityId: (args) => args[0],
  })
  async markAsPaid(billingId: UUID, notes?: string): Promise<OrganizationBilling> {
    const billing = await this.getBillingById(billingId);

    if (billing.status === BillingStatus.PAID) {
      throw new ValidationError('Billing already marked as paid');
    }

    billing.status = BillingStatus.PAID;
    billing.paidAt = new Date();
    if (notes) {
      billing.notes = notes;
    }

    const savedBilling = await this.billingRepository.save(billing);

    // Create BILLING_PAID activity for all linked orders
    if (billing.orders && billing.orders.length > 0) {
      const activities = billing.orders.map((order) => ({
        orderId: order.id,
        status: OrderStatus.BILLING_PAID,
        notes: `Billing invoice ${billing.invoiceNumber} paid`,
      }));
      await this.orderActivityRepository.save(activities);
    }

    // Send payment received email (non-blocking)
    if (billing.organization?.email && billing.invoiceNumber) {
      this.emailService
        .sendBillingPaymentReceivedEmail({
          organizationName: billing.organization.name,
          adminEmail: billing.organization.email,
          invoiceNumber: billing.invoiceNumber,
          amount: Number(billing.totalAmount),
          currency: billing.currency || 'RWF',
          paymentDate: new Date(),
        })
        .catch(() => {});
    }

    return savedBilling;
  }

  // GET BILLING HISTORY
  async getBillingHistory(
    organizationId: UUID,
    query: BillingQuery
  ): Promise<Pagination<OrganizationBilling>> {
    const {
      page = 0,
      size = 10,
      status,
      billingPeriod,
      sortBy = 'periodStart',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = query;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const queryBuilder = this.billingRepository
      .createQueryBuilder('billing')
      .leftJoinAndSelect('billing.createdBy', 'createdBy')
      .where('billing.organizationId = :organizationId', { organizationId });

    if (status) {
      queryBuilder.andWhere('billing.status = :status', { status });
    }

    if (billingPeriod) {
      queryBuilder.andWhere('billing.billingPeriod = :billingPeriod', { billingPeriod });
    }

    // Date range filtering on periodStart
    if (startDate) {
      queryBuilder.andWhere('billing.periodStart >= :startDate', {
        startDate: new Date(startDate as string),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('billing.periodEnd <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    // Validate and apply sorting
    const allowedSortFields = ['periodStart', 'periodEnd', 'totalAmount', 'status', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'periodStart';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .skip(skip)
      .take(take)
      .orderBy(`billing.${sortField}`, order);

    const [billings, total] = await queryBuilder.getManyAndCount();

    return getPagingData({
      data: [billings, total],
      page: Number(page),
      size: Number(size),
    });
  }

  // GET BILLING SUMMARY
  async getBillingSummary(organizationId: UUID): Promise<{
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    totalInvoiced: number;
  }> {
    const billings = await this.billingRepository.find({
      where: { organizationId },
    });

    const summary = {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalInvoiced: 0,
    };

    for (const billing of billings) {
      const amount = Number(billing.totalAmount);
      switch (billing.status) {
        case BillingStatus.PAID:
          summary.totalPaid += amount;
          break;
        case BillingStatus.PENDING:
          summary.totalPending += amount;
          break;
        case BillingStatus.OVERDUE:
          summary.totalOverdue += amount;
          break;
        case BillingStatus.INVOICED:
          summary.totalInvoiced += amount;
          break;
      }
    }

    return summary;
  }

  // GET GLOBAL BILLING SUMMARY (for admin dashboard)
  async getGlobalBillingSummary(): Promise<GlobalBillingSummary> {
    // Get total active organizations count
    const totalOrganizations = await this.organizationRepository.count({
      where: { status: OrganizationStatus.ACTIVE },
    });

    // Get global totals using SQL aggregation
    const globalTotals = await this.billingRepository
      .createQueryBuilder('billing')
      .select([
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status = :paid), 0)::numeric AS "totalPaid"`,
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status = :pending), 0)::numeric AS "totalPending"`,
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status = :overdue), 0)::numeric AS "totalOverdue"`,
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status = :invoiced), 0)::numeric AS "totalInvoiced"`,
      ])
      .setParameters({
        paid: BillingStatus.PAID,
        pending: BillingStatus.PENDING,
        overdue: BillingStatus.OVERDUE,
        invoiced: BillingStatus.INVOICED,
      })
      .getRawOne();

    // Get per-organization breakdown using SQL aggregation
    const orgBreakdown = await this.billingRepository
      .createQueryBuilder('billing')
      .leftJoin('billing.organization', 'organization')
      .select([
        'billing.organization_id AS "organizationId"',
        'organization.name AS "organizationName"',
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status = :paid), 0)::numeric AS "totalPaid"`,
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status IN (:...pendingStatuses)), 0)::numeric AS "totalPending"`,
        `COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status = :overdue), 0)::numeric AS "totalOverdue"`,
      ])
      .setParameters({
        paid: BillingStatus.PAID,
        pendingStatuses: [BillingStatus.PENDING, BillingStatus.INVOICED],
        overdue: BillingStatus.OVERDUE,
      })
      .groupBy('billing.organization_id')
      .addGroupBy('organization.name')
      .orderBy(`COALESCE(SUM(billing.total_amount) FILTER (WHERE billing.status IN ('PENDING', 'INVOICED', 'OVERDUE')), 0)`, 'DESC')
      .getRawMany();

    return {
      totalOrganizations,
      totalPaid: Number(globalTotals?.totalPaid || 0),
      totalPending: Number(globalTotals?.totalPending || 0),
      totalOverdue: Number(globalTotals?.totalOverdue || 0),
      totalInvoiced: Number(globalTotals?.totalInvoiced || 0),
      organizationBreakdown: orgBreakdown.map((row) => ({
        organizationId: row.organizationId,
        organizationName: row.organizationName || 'Unknown',
        totalPaid: Number(row.totalPaid || 0),
        totalPending: Number(row.totalPending || 0),
        totalOverdue: Number(row.totalOverdue || 0),
      })),
    };
  }

  // GET ALL BILLINGS WITH PAGINATION (for admin)
  async getAllBillings(query: BillingQuery): Promise<Pagination<OrganizationBilling>> {
    const {
      page = 0,
      size = 10,
      status,
      billingPeriod,
      sortBy = 'periodStart',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = query;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const queryBuilder = this.billingRepository
      .createQueryBuilder('billing')
      .leftJoinAndSelect('billing.organization', 'organization')
      .leftJoinAndSelect('billing.createdBy', 'createdBy');

    if (status) {
      queryBuilder.andWhere('billing.status = :status', { status });
    }

    if (billingPeriod) {
      queryBuilder.andWhere('billing.billingPeriod = :billingPeriod', { billingPeriod });
    }

    if (startDate) {
      queryBuilder.andWhere('billing.periodStart >= :startDate', {
        startDate: new Date(startDate as string),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('billing.periodEnd <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    const allowedSortFields = ['periodStart', 'periodEnd', 'totalAmount', 'status', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'periodStart';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .skip(skip)
      .take(take)
      .orderBy(`billing.${sortField}`, order);

    const [billings, total] = await queryBuilder.getManyAndCount();

    return getPagingData({
      data: [billings, total],
      page: Number(page),
      size: Number(size),
    });
  }
}
