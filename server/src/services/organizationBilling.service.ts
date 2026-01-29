import { FindOptionsWhere, Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrganizationBilling } from '../entities/organizationBilling.entity';
import { BillingStatus, BillingPeriod } from '../constants/organization.constants';
import { UUID } from '../types';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { Request } from 'express';
import { Order } from '../entities/order.entity';
import { generateReferenceNumber } from '../helpers/string.helper';

export class OrganizationBillingService {
  private readonly billingRepository: Repository<OrganizationBilling>;
  private readonly orderRepository: Repository<Order>;

  constructor() {
    this.billingRepository = AppDataSource.getRepository(OrganizationBilling);
    this.orderRepository = AppDataSource.getRepository(Order);
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

    // Get or create current billing period
    const billing = await this.getOrCreateCurrentBillingPeriod(
      order.organizationId
    );

    // Update billing totals
    billing.totalOrders += 1;
    billing.totalAmount = Number(billing.totalAmount) + Number(orderAmount);

    await this.billingRepository.save(billing);

    // Link order to billing
    order.organizationBillingId = billing.id;
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

  // GENERATE INVOICE
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

    return this.billingRepository.save(billing);
  }

  // MARK AS PAID
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

    return this.billingRepository.save(billing);
  }

  // GET BILLING HISTORY
  async getBillingHistory(
    organizationId: UUID,
    query: Request['query']
  ): Promise<Pagination<OrganizationBilling>> {
    const { page = 0, size = 10, status, billingPeriod } = query;

    let condition: FindOptionsWhere<OrganizationBilling> = {
      organizationId,
    };

    if (status) {
      condition.status = status as BillingStatus;
    }

    if (billingPeriod) {
      condition.billingPeriod = billingPeriod as BillingPeriod;
    }

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const billings = await this.billingRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
      order: {
        periodStart: 'DESC',
      },
    });

    return getPagingData({
      data: billings,
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
}
