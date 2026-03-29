import { FindOptionsWhere, Repository, Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrganizationBilling } from '../entities/organizationBilling.entity';
import { BillingStatus, BillingPeriod, OrganizationStatus } from '../constants/organization.constants';
import { UUID } from '../types';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { Order } from '../entities/order.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import {
  OrderActivityStatus,
  OrderPaymentStatus,
  OrderStatus,
} from '../constants/order.constants';
import { generateReferenceNumber } from '../helpers/string.helper';
import { BillingQuery, GlobalBillingSummary } from '../types/b2b.types';
import { Organization } from '../entities/organization.entity';
import { BusinessPlan } from '../entities/businessPlan.entity';
import { EmailService } from '../integrations/emails/email.service';
import { AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import { calculateBillingTotal } from '../helpers/pricing.helper';
import { TierBreakdown } from '../constants/businessPlan.constants';

export class OrganizationBillingService {
  private readonly billingRepository: Repository<OrganizationBilling>;
  private readonly orderRepository: Repository<Order>;
  private readonly orderActivityRepository: Repository<OrderActivity>;
  private readonly organizationRepository: Repository<Organization>;
  private readonly businessPlanRepository: Repository<BusinessPlan>;
  private readonly emailService: EmailService;

  constructor() {
    this.billingRepository = AppDataSource.getRepository(OrganizationBilling);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderActivityRepository = AppDataSource.getRepository(OrderActivity);
    this.organizationRepository = AppDataSource.getRepository(Organization);
    this.businessPlanRepository = AppDataSource.getRepository(BusinessPlan);
    this.emailService = new EmailService();
  }

  private resolveBillingBreakdown(
    billing: Pick<
      OrganizationBilling,
      "pricingSnapshot" | "tierBreakdown" | "totalOrders" | "totalAmount"
    >,
    forceRecalculate = false,
  ): { breakdown: TierBreakdown[]; totalAmount: number } {
    if (billing.pricingSnapshot?.tiers?.length && forceRecalculate) {
      const result = calculateBillingTotal(
        billing.pricingSnapshot,
        billing.totalOrders,
      );
      return {
        breakdown: result.breakdown,
        totalAmount: result.total,
      };
    }

    const breakdown = billing.tierBreakdown ?? [];
    if (breakdown.length === 0 && billing.pricingSnapshot?.tiers?.length) {
      const result = calculateBillingTotal(
        billing.pricingSnapshot,
        billing.totalOrders,
      );
      return {
        breakdown: result.breakdown,
        totalAmount: result.total,
      };
    }

    return {
      breakdown,
      totalAmount: Number(billing.totalAmount),
    };
  }

  // CHECK WHETHER NEW BUSINESS ORDERS SHOULD BE BLOCKED UNTIL BILLING IS SETTLED
  async getOrderCreationBillingGuard(
    organizationId: UUID,
    billingPeriod: BillingPeriod = BillingPeriod.MONTHLY
  ): Promise<{
    blocked: boolean;
    blockType?: 'UNPAID_INVOICED_OR_OVERDUE' | 'PREVIOUS_PERIOD_UNPAID' | 'PLAN_LIMIT_REACHED';
    reason?: string;
    billing?: OrganizationBilling;
  }> {
    const now = new Date();

    // 1) Hard block when there is already an invoiced/overdue billing
    const payableStatuses = [BillingStatus.INVOICED, BillingStatus.OVERDUE];
    const blockingDueBilling = await this.billingRepository
      .createQueryBuilder('billing')
      .where('billing.organizationId = :organizationId', { organizationId })
      .andWhere('billing.status IN (:...statuses)', { statuses: payableStatuses })
      .orderBy('billing.periodEnd', 'ASC')
      .getOne();

    if (blockingDueBilling) {
      return {
        blocked: true,
        blockType: 'UNPAID_INVOICED_OR_OVERDUE',
        reason:
          'You have an unpaid invoiced or overdue billing. Please pay first to continue creating deliveries.',
        billing: blockingDueBilling,
      };
    }

    // 2) Block if a previous billing period ended and remains unpaid (time threshold exceeded)
    const expiredUnpaidBilling = await this.billingRepository
      .createQueryBuilder('billing')
      .where('billing.organizationId = :organizationId', { organizationId })
      .andWhere('billing.status = :pending', { pending: BillingStatus.PENDING })
      .andWhere('billing.periodEnd < :now', { now })
      .orderBy('billing.periodEnd', 'ASC')
      .getOne();

    if (expiredUnpaidBilling) {
      return {
        blocked: true,
        blockType: 'PREVIOUS_PERIOD_UNPAID',
        reason:
          'A previous billing period ended and is still unpaid. Please settle the old amount first to continue.',
        billing: expiredUnpaidBilling,
      };
    }

    // 3) Enforce plan delivery threshold for the current billing period
    const currentBilling = await this.getOrCreateCurrentBillingPeriod(
      organizationId,
      billingPeriod
    );
    const tiers = currentBilling.pricingSnapshot?.tiers || [];
    const finiteMaxQuantities = tiers
      .map((tier) => tier.maxQuantity)
      .filter((value): value is number => value != null);
    const hasOverflowPricing =
      typeof currentBilling.pricingSnapshot?.overflowRate === 'number' &&
      currentBilling.pricingSnapshot.overflowRate > 0;
    const hasUnlimitedNonCustomTier = tiers.some(
      (tier) => !tier.isCustom && tier.maxQuantity == null,
    );

    if (
      finiteMaxQuantities.length > 0 &&
      !hasOverflowPricing &&
      !hasUnlimitedNonCustomTier
    ) {
      const maxAllowedOrders = Math.max(...finiteMaxQuantities);
      if (currentBilling.totalOrders >= maxAllowedOrders) {
        return {
          blocked: true,
          blockType: 'PLAN_LIMIT_REACHED',
          reason:
            'You reached your current plan delivery limit. Please pay the old amount on your current plan, then move to a convenient new business plan to keep creating deliveries.',
          billing: currentBilling,
        };
      }
    }

    return { blocked: false };
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
    } else if (billingPeriod === BillingPeriod.DAILY) {
      // Start of today
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodStart.setHours(0, 0, 0, 0);
      // End of today
      periodEnd = new Date(periodStart);
      periodEnd.setHours(23, 59, 59);
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
        status: BillingStatus.PENDING,
        periodStart: LessThanOrEqual(now),
        periodEnd: MoreThanOrEqual(now),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (billing) {
      return billing;
    }

    // Snapshot the organization's current business plan pricing
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: { businessPlan: true },
    });

    const businessPlan = organization?.businessPlan;

    // Create new billing period with pricing snapshot
    const newBilling = await this.billingRepository.save({
      organizationId,
      billingPeriod,
      periodStart,
      periodEnd,
      totalOrders: 0,
      totalAmount: 0,
      currency: businessPlan?.currency || 'RWF',
      status: BillingStatus.PENDING,
      businessPlanId: businessPlan?.id,
      pricingSnapshot: businessPlan?.pricingTiers || undefined,
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

    if (billing.pricingSnapshot?.tiers?.length) {
      // Tier-based pricing: recalculate total from scratch
      // Use transaction with row lock to prevent race conditions
      await AppDataSource.transaction(async (manager) => {
        const lockedBilling = await manager
          .getRepository(OrganizationBilling)
          .createQueryBuilder('billing')
          .setLock('pessimistic_write')
          .where('billing.id = :id', { id: billing.id })
          .getOne();

        if (!lockedBilling) return;

        const newTotalOrders = lockedBilling.totalOrders + 1;
        const { breakdown, total } = calculateBillingTotal(
          lockedBilling.pricingSnapshot!,
          newTotalOrders
        );

        lockedBilling.totalOrders = newTotalOrders;
        lockedBilling.totalAmount = total;
        lockedBilling.tierBreakdown = breakdown;
        await manager.save(lockedBilling);
      });
    } else {
      // Fallback: simple atomic increment for flat pricing
      await this.billingRepository
        .createQueryBuilder()
        .update(OrganizationBilling)
        .set({
          totalOrders: () => 'total_orders + 1',
          totalAmount: () => `total_amount + ${Number(orderAmount)}`,
        })
        .where('id = :id', { id: billing.id })
        .execute();
    }

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

    if (billing.pricingSnapshot?.tiers?.length) {
      // Tier-based pricing: recalculate total from scratch
      await AppDataSource.transaction(async (manager) => {
        const lockedBilling = await manager
          .getRepository(OrganizationBilling)
          .createQueryBuilder('billing')
          .setLock('pessimistic_write')
          .where('billing.id = :id', { id: billing.id })
          .getOne();

        if (!lockedBilling) return;

        const newTotalOrders = Math.max(lockedBilling.totalOrders - 1, 0);
        const { breakdown, total } = calculateBillingTotal(
          lockedBilling.pricingSnapshot!,
          newTotalOrders
        );

        lockedBilling.totalOrders = newTotalOrders;
        lockedBilling.totalAmount = total;
        lockedBilling.tierBreakdown = breakdown;
        await manager.save(lockedBilling);
      });
    } else {
      // Fallback: simple atomic decrement for flat pricing
      await this.billingRepository
        .createQueryBuilder()
        .update(OrganizationBilling)
        .set({
          totalOrders: () => 'GREATEST(total_orders - 1, 0)',
          totalAmount: () => `GREATEST(total_amount - ${Number(orderAmount)}, 0)`,
        })
        .where('id = :id', { id: billing.id })
        .execute();
    }

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

  async getBillingByIdForOrganization(
    id: UUID,
    organizationId: UUID,
  ): Promise<OrganizationBilling> {
    const billing = await this.getBillingById(id);

    if (billing.organizationId !== organizationId) {
      throw new NotFoundError('Billing record not found for this organization');
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

    const resolvedBilling = this.resolveBillingBreakdown(billing, true);
    billing.totalAmount = resolvedBilling.totalAmount;
    billing.tierBreakdown = resolvedBilling.breakdown;
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
          tierBreakdown: billing.tierBreakdown ?? undefined,
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
  async markAsPaid(
    billingId: UUID,
    notes?: string,
    amountPaid?: number
  ): Promise<OrganizationBilling> {
    const billing = await this.getBillingById(billingId);

    if (billing.status === BillingStatus.PAID) {
      throw new ValidationError('Billing already marked as paid');
    }

    if (amountPaid != null) {
      if (Number.isNaN(amountPaid) || amountPaid <= 0) {
        throw new ValidationError('Paid amount must be greater than zero');
      }

      // Early payment support: settle this billing with the provided amount.
      // Keep within current billed amount to avoid accidental overpayment records.
      billing.totalAmount = Math.min(Number(amountPaid), Number(billing.totalAmount));
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
        status: OrderActivityStatus.BILLING_PAID,
        notes: `Billing invoice ${billing.invoiceNumber} paid`,
      }));
      await this.orderActivityRepository.save(activities);

      await this.orderRepository.update(
        {
          id: In(billing.orders.map((order) => order.id)),
          paymentStatus: OrderPaymentStatus.PENDING,
        },
        {
          paymentStatus: OrderPaymentStatus.COMPLETED,
        }
      );
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
      .leftJoinAndSelect('billing.businessPlan', 'businessPlan')
      .leftJoinAndSelect('billing.orders', 'orders')
      .leftJoinAndSelect('orders.recipient', 'recipient')
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

  // GET BILLING BREAKDOWN
  async getBillingBreakdown(billingId: UUID): Promise<{
    billing: OrganizationBilling;
    breakdown: TierBreakdown[];
    planName: string;
    billingPeriod: string;
    periodStart: Date;
    periodEnd: Date;
    totalOrders: number;
    totalAmount: number;
    currency: string;
  }> {
    const billing = await this.billingRepository.findOne({
      where: { id: billingId },
      relations: { organization: true, businessPlan: true },
    });
 
    if (!billing) {
      throw new NotFoundError('Billing record not found');
    }

    const resolvedBilling = this.resolveBillingBreakdown(billing);

    return {
      billing,
      breakdown: resolvedBilling.breakdown,
      planName: billing.businessPlan?.name ?? 'Unknown Plan',
      billingPeriod: billing.billingPeriod,
      periodStart: billing.periodStart,
      periodEnd: billing.periodEnd,
      totalOrders: billing.totalOrders,
      totalAmount: resolvedBilling.totalAmount,
      currency: billing.currency || 'RWF',
    };
  }

  // CALCULATE EARLY PAYMENT AMOUNT
  async calculateEarlyPaymentAmount(billingId: UUID): Promise<{
    billing: OrganizationBilling;
    breakdown: TierBreakdown[];
    totalAmount: number;
    currency: string;
    note: string;
  }> {
    const billing = await this.billingRepository.findOne({
      where: { id: billingId },
      relations: { organization: true, businessPlan: true },
    });
 
    if (!billing) {
      throw new NotFoundError('Billing record not found');
    }

    const resolvedBilling = this.resolveBillingBreakdown(billing, true);

    return {
      billing,
      breakdown: resolvedBilling.breakdown,
      totalAmount: resolvedBilling.totalAmount,
      currency: billing.currency || 'RWF',
      note: `Based on ${billing.totalOrders} deliveries so far this period`,
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
      .leftJoinAndSelect('billing.businessPlan', 'businessPlan')
      .leftJoinAndSelect('billing.orders', 'orders')
      .leftJoinAndSelect('orders.recipient', 'recipient')
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
