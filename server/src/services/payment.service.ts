import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AppDataSource } from '../data-source';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from '../types/payment.types';
import { KpayService } from '../integrations/kpay/kpay.service';
import { KpayPaymentStatus } from '../types/kpay.types';
import { Request } from 'express';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { UUID } from '../types';
import { PaymentType } from '../constants/payment.constants';
import { NotFoundError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { OrderActivityService } from './orderActivity.service';
import { OrderStatus } from '../constants/order.constants';
import { OrderActivity } from '../entities/orderActivity.entity';
import { OrderAssignmentService } from './orderAssignment.service';
import { EmailService } from '../integrations/emails/email.service';
import { Order } from '../entities/order.entity';
import { AuditCreate, AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';

export class PaymentService {
  private readonly paymentRepository: Repository<Payment>;
  private readonly kpayService: KpayService;
  private readonly orderActivityService: OrderActivityService;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly emailService: EmailService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.kpayService = new KpayService();
    this.orderActivityService = new OrderActivityService();
    this.orderAssignmentService = new OrderAssignmentService();
    this.emailService = new EmailService();
  }

  // CREATE PAYMENT
  @AuditCreate({
    entityType: AuditLogEntityTypes.PAYMENT,
  })
  async createPayment(payment: CreatePaymentDto): Promise<Payment> {
    const newPayment: Payment = await this.paymentRepository.save({
      entityId: payment.entityId,
      amount: Number(payment.amount),
      externalReferenceId: undefined,
      internalReferenceId: payment?.entityId,
      status: KpayPaymentStatus.PENDING,
      customerEmail: payment?.customerEmail,
      customerName: payment?.customerName,
      customerPhone: payment?.customerPhone,
    });

    let result;

    if (newPayment) {
      result = await this.kpayService.initiatePayment({
        amount: payment.amount,
        currency: payment.currency,
        customerEmail: payment?.customerEmail,
        customerName: payment?.customerName,
        customerPhone: payment?.customerPhone,
        refId: newPayment?.id as UUID,
        description: payment.description,
      });
    }

    if (result && result.success && result.data?.transactionId) {
      newPayment.externalReferenceId = result.data?.transactionId;
      newPayment.status = result.data?.status as KpayPaymentStatus;
      await this.paymentRepository.update(newPayment?.id, newPayment);
      this.updatePaymentStatus(
        newPayment?.id as UUID,
        result.data?.status as KpayPaymentStatus,
      );
      return newPayment;
    }

    // Send payment initiated email (non-blocking)
    if (payment.customerEmail) {
      this.emailService
        .sendPaymentInitiatedEmail({
          customerName: payment.customerName || '',
          customerEmail: payment.customerEmail,
          orderReference: payment.entityId as string,
          amount: payment.amount,
          currency: payment.currency || 'RWF',
        })
        .catch(() => {});
    }

    return newPayment;
  }

  // FETCH PAYMENTS
  async fetchPayments(query: Request['query']): Promise<Pagination<Payment>> {
    const {
      page = 0,
      size = 10,
      entityId,
      type,
      status,
      startDate,
      endDate,
    } = query;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    let condition: FindOptionsWhere<Payment> | FindOptionsWhere<Payment>[] = {};

    if (entityId) {
      condition.entityId = entityId as UUID;
    }

    if (type) {
      condition.type = type as PaymentType;
    }

    if (status) {
      condition.status = status as KpayPaymentStatus;
    }

    if (startDate) {
      condition.createdAt = MoreThanOrEqual(new Date(startDate as string));
    }

    if (endDate) {
      condition.createdAt = LessThanOrEqual(new Date(endDate as string));
    }

    const payments = await this.paymentRepository.findAndCount({
      where: condition,
      skip,
      take,
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({
      data: payments,
      page: Number(page),
      size: Number(size),
    });
  }

  // UPDATE PAYMENT STATUS
  @AuditUpdate({
    entityType: AuditLogEntityTypes.PAYMENT,
    getEntityId: (args) => args[0],
  })
  async updatePaymentStatus(
    paymentId: UUID,
    status: KpayPaymentStatus,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    // ORDER
    const order: Order | null = await AppDataSource.getRepository(
      Order,
    ).findOne({
      where: { id: payment?.entityId },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found', {
        referenceId: paymentId,
        referenceType: LogReferenceTypes.PAYMENT,
      });
    }

    payment.status = status as KpayPaymentStatus;
    await this.paymentRepository.update(payment?.id as UUID, payment);

    let orderActivity: OrderActivity | undefined;
    if (status === KpayPaymentStatus.SUCCESSFUL) {
      orderActivity = await this.orderActivityService.createOrderActivity({
        orderId: payment?.entityId,
        status: OrderStatus.PAID,
        notes: payment?.externalReferenceId ?? undefined,
        createdById: payment?.createdById ?? undefined,
      });
      await this.orderAssignmentService.handleOrderAssignment({
        orderId: payment?.entityId as UUID,
      });
    }

    if (status === KpayPaymentStatus?.FAILED && payment?.customerEmail) {
      // Send payment failed email (non-blocking)
      this.emailService
        .sendPaymentFailedEmail({
          customerName: payment?.customerName || '',
          customerEmail: payment?.customerEmail,
          orderReference: order?.referenceId || (payment?.entityId as string),
          amount: Number(payment?.amount),
          currency: 'RWF',
        })
        .catch(() => {});
    }

    return payment;
  }

  // ADMIN: FETCH PAYMENTS WITH COMPREHENSIVE FILTERS
  async fetchAdminPayments(
    query: Request['query'],
  ): Promise<Pagination<Payment>> {
    const {
      page = 0,
      size = 10,
      status,
      currency,
      method,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      searchKey,
    } = query;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.createdBy', 'createdBy')
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (currency) {
      queryBuilder.andWhere('payment.currency = :currency', { currency });
    }

    if (method) {
      queryBuilder.andWhere('payment.method = :method', { method });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'payment.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string),
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(startDate as string),
      });
    } else if (endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    if (minAmount) {
      queryBuilder.andWhere('payment.amount >= :minAmount', {
        minAmount: Number(minAmount),
      });
    }

    if (maxAmount) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', {
        maxAmount: Number(maxAmount),
      });
    }

    if (searchKey) {
      queryBuilder.andWhere(
        '(payment.externalReferenceId ILIKE :searchKey OR payment.internalReferenceId ILIKE :searchKey OR payment.customerEmail ILIKE :searchKey OR payment.customerName ILIKE :searchKey OR payment.customerPhone ILIKE :searchKey)',
        { searchKey: `%${searchKey}%` },
      );
    }

    const [rows, totalCount] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return {
      rows,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(size)),
      currentPage: Number(page) + 1,
    };
  }

  // ADMIN: GET PAYMENT STATS
  async getPaymentStats(query: Request['query']): Promise<{
    totalRevenue: number;
    totalPayments: number;
    pendingCount: number;
    successfulCount: number;
    failedCount: number;
    pendingAmount: number;
    successfulAmount: number;
    failedAmount: number;
  }> {
    const { startDate, endDate, currency } = query;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment');

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'payment.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string),
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(startDate as string),
      });
    } else if (endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    if (currency) {
      queryBuilder.andWhere('payment.currency = :currency', { currency });
    }

    const stats = await queryBuilder
      .select([
        'COUNT(*)::int AS "totalPayments"',
        'COALESCE(SUM(payment.amount), 0)::numeric AS "totalRevenue"',
        'COUNT(*) FILTER (WHERE payment.status = :pending)::int AS "pendingCount"',
        'COUNT(*) FILTER (WHERE payment.status = :successful)::int AS "successfulCount"',
        'COUNT(*) FILTER (WHERE payment.status = :failed)::int AS "failedCount"',
        'COALESCE(SUM(payment.amount) FILTER (WHERE payment.status = :pending), 0)::numeric AS "pendingAmount"',
        'COALESCE(SUM(payment.amount) FILTER (WHERE payment.status = :successful), 0)::numeric AS "successfulAmount"',
        'COALESCE(SUM(payment.amount) FILTER (WHERE payment.status = :failed), 0)::numeric AS "failedAmount"',
      ])
      .setParameters({
        pending: KpayPaymentStatus.PENDING,
        successful: KpayPaymentStatus.SUCCESSFUL,
        failed: KpayPaymentStatus.FAILED,
      })
      .getRawOne();

    return {
      totalRevenue: Number(stats?.totalRevenue || 0),
      totalPayments: Number(stats?.totalPayments || 0),
      pendingCount: Number(stats?.pendingCount || 0),
      successfulCount: Number(stats?.successfulCount || 0),
      failedCount: Number(stats?.failedCount || 0),
      pendingAmount: Number(stats?.pendingAmount || 0),
      successfulAmount: Number(stats?.successfulAmount || 0),
      failedAmount: Number(stats?.failedAmount || 0),
    };
  }

  // ADMIN: UPDATE PAYMENT STATUS (manual)
  async adminUpdatePaymentStatus(
    paymentId: UUID,
    status: KpayPaymentStatus,
  ): Promise<Payment> {
    return this.updatePaymentStatus(paymentId, status);
  }

  // ADMIN: EXPORT PAYMENTS (returns all matching payments without pagination)
  async exportPayments(
    query: Request['query'],
  ): Promise<Payment[]> {
    const {
      status,
      currency,
      method,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      searchKey,
    } = query;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.createdBy', 'createdBy')
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (currency) {
      queryBuilder.andWhere('payment.currency = :currency', { currency });
    }

    if (method) {
      queryBuilder.andWhere('payment.method = :method', { method });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'payment.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string),
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(startDate as string),
      });
    } else if (endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    if (minAmount) {
      queryBuilder.andWhere('payment.amount >= :minAmount', {
        minAmount: Number(minAmount),
      });
    }

    if (maxAmount) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', {
        maxAmount: Number(maxAmount),
      });
    }

    if (searchKey) {
      queryBuilder.andWhere(
        '(payment.externalReferenceId ILIKE :searchKey OR payment.internalReferenceId ILIKE :searchKey OR payment.customerEmail ILIKE :searchKey OR payment.customerName ILIKE :searchKey OR payment.customerPhone ILIKE :searchKey)',
        { searchKey: `%${searchKey}%` },
      );
    }

    return queryBuilder.getMany();
  }
}
