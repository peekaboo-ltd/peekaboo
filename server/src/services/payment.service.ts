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
import { KpayPaymentMethod, KpayPaymentStatus } from '../types/kpay.types';
import { UrubutoService } from '../integrations/urubuto/urubuto.service';
import {
  PaymentProvider,
  UrubutoChannelName,
  UrubutoPaymentWebhookPayload,
  UrubutoPayerValidationRequest,
  UrubutoTransactionStatus,
} from '../types/urubuto.types';
import { Request } from 'express';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { UUID } from '../types';
import { PaymentType } from '../constants/payment.constants';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { OrderActivityService } from './orderActivity.service';
import { OrderActivityStatus } from '../constants/order.constants';
import { OrderActivity } from '../entities/orderActivity.entity';
import { OrderAssignmentService } from './orderAssignment.service';
import { EmailService } from '../integrations/emails/email.service';
import { Order } from '../entities/order.entity';
import { Conversation } from '../entities/conversation.entity';
import { AuditCreate, AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import { formatPhoneNumber } from '../helpers/phone.helper';
import { ConversationStatus } from '../constants/conversation.constants';
import logger from '../helpers/logger.helper';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  resolveChargeableAmount,
} from '../helpers/developmentPricing.helper';

export class PaymentService {
  private readonly paymentRepository: Repository<Payment>;
  private readonly kpayService: KpayService;
  private readonly urubutoService: UrubutoService;
  private readonly orderActivityService: OrderActivityService;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly emailService: EmailService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.kpayService = new KpayService();
    this.urubutoService = new UrubutoService();
    this.orderActivityService = new OrderActivityService();
    this.orderAssignmentService = new OrderAssignmentService();
    this.emailService = new EmailService();
  }


  // CREATE PAYMENT
  @AuditCreate({
    entityType: AuditLogEntityTypes.PAYMENT,
  })
  async createPayment(payment: CreatePaymentDto): Promise<Payment> {
    const provider = this.resolvePaymentProvider(payment.provider);
    const requestedMethod =
      payment.channelName ||
      payment.method ||
      payment.metadata?.channelName ||
      (provider === PaymentProvider.URUBUTO
        ? UrubutoChannelName.MOMO
        : KpayPaymentMethod.MOBILE_MONEY);
    const customerPhone = this.normalizePaymentPhone(payment.customerPhone);
    const requiresPhone =
      provider === PaymentProvider.KPAY ||
      requestedMethod === UrubutoChannelName.MOMO ||
      requestedMethod === UrubutoChannelName.AIRTEL_MONEY ||
      requestedMethod === KpayPaymentMethod.MOBILE_MONEY;

    if (requiresPhone && !customerPhone) {
      throw new ValidationError('A valid payer phone number is required');
    }

    let redirectUrl: string | undefined;

    if (requestedMethod === UrubutoChannelName.CARD) {
      redirectUrl = this.getPaymentRedirectUrl(payment.entityId);
      this.validateCardPaymentRedirectUrl(redirectUrl);

      logger.debug('Resolved CARD payment redirect URL', {
        entityId: payment.entityId,
        provider,
        channelName: requestedMethod,
        redirectUrl,
      });
    }

    const {
      chargeAmount,
      isDevelopmentPricing,
      catalogAmount,
    } = resolveChargeableAmount(Number(payment.amount));

    const paymentMetadata: Record<string, any> = {
      ...(payment.metadata || {}),
      ...(isDevelopmentPricing
        ? {
            developmentPricing: true,
            catalogAmount,
            chargedAmount: DEVELOPMENT_PAYMENT_AMOUNT_RWF,
          }
        : {}),
    };

    if (isDevelopmentPricing) {
      logger.info('Development pricing applied to payment', {
        entityId: payment.entityId,
        catalogAmount,
        chargeAmount,
      });
    }

    const newPayment: Payment = await this.paymentRepository.save({
      entityId: payment.entityId,
      amount: chargeAmount,
      externalReferenceId: undefined,
      internalReferenceId: payment?.entityId,
      status: KpayPaymentStatus.PENDING,
      customerEmail: payment?.customerEmail,
      customerName: payment?.customerName,
      customerPhone,
      currency: payment.currency,
      type: payment.type,
      description: payment.description || '',
      createdById: payment.createdById,
      provider,
      method: requestedMethod,
      metadata: paymentMetadata,
    });

    let result: any;

    if (newPayment && provider === PaymentProvider.KPAY) {
      result = await this.kpayService.initiatePayment({
        amount: chargeAmount,
        currency: payment.currency,
        customerEmail: payment?.customerEmail,
        customerName: payment?.customerName,
        customerPhone,
        refId: newPayment?.id as UUID,
        description: payment.description,
      });
    } else if (newPayment) {
      const payerCode = await this.resolveUrubutoPayerCode(payment.entityId);

      result = await this.urubutoService.initiatePayment({
        amount: chargeAmount,
        currency: payment.currency,
        customerEmail: payment?.customerEmail,
        customerName: payment?.customerName,
        customerPhone,
        refId: newPayment?.id as UUID,
        payerCode,
        channelName: requestedMethod,
        redirectUrl: redirectUrl || this.getPaymentRedirectUrl(payment.entityId),
      });
    }

    if (result && result.success && result.data?.transactionId) {
      newPayment.externalReferenceId = result.data?.transactionId;
      newPayment.status = result.data?.status as KpayPaymentStatus;
      newPayment.metadata = {
        ...(newPayment.metadata || {}),
        ...(result.data?.metadata || {}),
        ...(result.data?.paymentUrl
          ? { paymentUrl: result.data.paymentUrl }
          : {}),
        providerMessage: result.data?.message,
      };
      newPayment.paymentUrl = result.data?.paymentUrl;
      await this.paymentRepository.update(newPayment.id, {
        externalReferenceId: newPayment.externalReferenceId,
        status: newPayment.status,
        metadata: newPayment.metadata,
        method: newPayment.method,
      });
      if (result.data?.status === KpayPaymentStatus.SUCCESSFUL) {
        await this.updatePaymentStatus(
          newPayment?.id as UUID,
          result.data?.status as KpayPaymentStatus,
        );
      }
      return newPayment;
    }

    if (result && !result.success) {
      const isUrubutoTimeout =
        provider === PaymentProvider.URUBUTO &&
        result.error?.code === 'URUBUTO_TIMEOUT';

      if (isUrubutoTimeout) {
        const timeoutMetadata = result.error?.metadata || {};
        const transactionId =
          timeoutMetadata.transactionId ||
          timeoutMetadata.localPaymentId ||
          newPayment.id;
        const verification =
          await this.verifyUrubutoTransactionStatus(transactionId as string);
        const verifiedStatus = verification.data?.transaction_status
          ? this.urubutoService.mapStatusToInternal(
              verification.data.transaction_status,
            )
          : undefined;
        const verifiedTransactionId =
          verification.data?.internal_transaction_id ||
          verification.data?.transaction_id ||
          transactionId;

        newPayment.status = verifiedStatus || KpayPaymentStatus.PENDING;
        newPayment.externalReferenceId = verifiedTransactionId;
        newPayment.metadata = {
          ...(newPayment.metadata || {}),
          initiationError: result.error,
          urubutoTimeoutReconciliation: {
            checkedAt: new Date().toISOString(),
            transactionId,
            verification,
          },
        };

        await this.paymentRepository.update(newPayment.id, {
          externalReferenceId: newPayment.externalReferenceId,
          status: newPayment.status,
          metadata: newPayment.metadata,
        });

        if (newPayment.status === KpayPaymentStatus.SUCCESSFUL) {
          await this.updatePaymentStatus(
            newPayment.id as UUID,
            newPayment.status,
            newPayment.metadata,
          );
        }

        return newPayment;
      }

      newPayment.status = KpayPaymentStatus.FAILED;
      newPayment.metadata = {
        ...(newPayment.metadata || {}),
        initiationError: result.error,
        ...(isUrubutoTimeout
          ? {
              pendingReconciliation: true,
              reconciliationReason: 'URUBUTO_INITIATION_TIMEOUT',
            }
          : {}),
      };
      await this.paymentRepository.update(newPayment.id, {
        status: newPayment.status,
        metadata: newPayment.metadata,
      });

      if (isUrubutoTimeout) {
        return newPayment;
      }

      throw new ValidationError(
        result.error?.message ||
          'UrubutoPay payment could not be initiated. Please try again.',
      );
    }

    // Send payment initiated email (non-blocking)
    if (payment.customerEmail) {
      this.emailService
        .sendPaymentInitiatedEmail({
          customerName: payment.customerName || '',
          customerEmail: payment.customerEmail,
          orderReference: payment.entityId as string,
          amount: chargeAmount,
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
    metadata?: Record<string, any>,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found', {
        referenceId: paymentId,
        referenceType: LogReferenceTypes.PAYMENT,
      });
    }

    // ORDER
    const order: Order | null = await AppDataSource.getRepository(
      Order,
    ).findOne({
      where: { id: payment?.entityId },
    });

    const previousStatus = payment.status;
    const existingMetadata = payment.metadata || {};
    const paidAfterWhatsappSessionExpired =
      status === KpayPaymentStatus.SUCCESSFUL &&
      (await this.isWhatsappSessionExpired(existingMetadata));

    payment.status = status as KpayPaymentStatus;
    payment.metadata = {
      ...existingMetadata,
      ...(metadata || {}),
      ...(paidAfterWhatsappSessionExpired
        ? { paidAfterWhatsappSessionExpired: true }
        : {}),
    };
    await this.paymentRepository.update(payment?.id as UUID, payment);

    if (paidAfterWhatsappSessionExpired && existingMetadata.conversationId) {
      await AppDataSource.getRepository(Conversation).update(
        { id: existingMetadata.conversationId as UUID },
        { status: ConversationStatus.ACTIVE },
      );
    }

    if (
      status === KpayPaymentStatus.SUCCESSFUL &&
      previousStatus !== KpayPaymentStatus.SUCCESSFUL
    ) {
      const existingPaidActivity = await AppDataSource.getRepository(
        OrderActivity,
      ).findOne({
        where: {
          orderId: payment.entityId,
          status: OrderActivityStatus.PAID,
        },
      });

      if (!existingPaidActivity) {
        await this.orderActivityService.createOrderActivity({
          orderId: payment?.entityId,
          status: OrderActivityStatus.PAID,
          notes: payment?.externalReferenceId ?? undefined,
          createdById: payment?.createdById ?? undefined,
        });
        await this.orderAssignmentService.handleOrderAssignment({
          orderId: payment?.entityId as UUID,
        });
      }
    }

    if (
      status === KpayPaymentStatus?.FAILED &&
      previousStatus !== KpayPaymentStatus.FAILED &&
      payment?.customerEmail
    ) {
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

  async validateUrubutoPayer(request: UrubutoPayerValidationRequest): Promise<{
    merchant_code: string;
    payer_code: string;
    payer_names: string;
    amount: number;
    currency: string;
    payer_must_pay_total_amount: string;
    comment: string;
  }> {
    if (
      !request.merchant_code ||
      request.merchant_code !== this.urubutoService.getMerchantCode()
    ) {
      throw new NotFoundError('merchant not found');
    }

    if (!request.payer_code) {
      throw new NotFoundError('no data found for the given payer code');
    }

    const order = await AppDataSource.getRepository(Order).findOne({
      where: { referenceId: request.payer_code },
      relations: {
        sender: true,
        recipient: true,
      },
    });

    if (!order) {
      throw new NotFoundError('no data found for the given payer code');
    }

    const catalogAmount = Number(order.finalFee || order.initialFee || 0);
    const { chargeAmount } = resolveChargeableAmount(catalogAmount);

    return {
      merchant_code: request.merchant_code,
      payer_code: request.payer_code,
      payer_names:
        order.sender?.name ||
        order.recipient?.name ||
        order.externalReferenceId ||
        order.referenceId,
      amount: chargeAmount,
      currency: 'RWF',
      payer_must_pay_total_amount: 'YES',
      comment: order.notes || order.description || 'Peekaboo order payment',
    };
  }

  async processUrubutoPaymentWebhook(
    payload: UrubutoPaymentWebhookPayload,
    source: 'callback' | 'notification' | 'reversal',
  ): Promise<Payment> {
    const payment = await this.findUrubutoPayment(payload);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const inferredStatus =
      source === 'reversal'
        ? UrubutoTransactionStatus.CANCELED
        : payload.transaction_status ||
          (payload.slip_number
            ? UrubutoTransactionStatus.VALID
            : UrubutoTransactionStatus.PENDING_SETTLEMENT);

    const status = this.urubutoService.mapStatusToInternal(inferredStatus);
    const externalReference =
      payload.internal_transaction_id ||
      payload.transaction_id ||
      payment.externalReferenceId;

    payment.externalReferenceId = externalReference;
    await this.paymentRepository.update(payment.id, {
      externalReferenceId: externalReference,
    });

    return this.updatePaymentStatus(payment.id as UUID, status, {
      [`urubuto${this.capitalize(source)}Payload`]: payload,
      urubutoLastStatus: inferredStatus,
      urubutoLastWebhookSource: source,
      urubutoLastWebhookAt: new Date().toISOString(),
      ...(payload.slip_number ? { slipNumber: payload.slip_number } : {}),
      ...(payload.initial_slip_number
        ? { initialSlipNumber: payload.initial_slip_number }
        : {}),
    });
  }


  private async isWhatsappSessionExpired(
    metadata: Record<string, any>,
  ): Promise<boolean> {
    if (metadata.localSessionExpiredAt) return true;

    if (metadata.paymentSessionExpiresAt) {
      return new Date(metadata.paymentSessionExpiresAt).getTime() <= Date.now();
    }

    if (metadata.conversationId) {
      const conversation = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: metadata.conversationId as UUID },
      });

      return conversation?.status === ConversationStatus.EXPIRED;
    }

    return false;
  }

  async verifyUrubutoTransactionStatus(transactionId: string) {
    return this.urubutoService.verifyTransactionStatus(transactionId);
  }

  private async resolveUrubutoPayerCode(entityId: UUID): Promise<string> {
    const order = await AppDataSource.getRepository(Order).findOne({
      where: { id: entityId },
    });

    if (!order) {
      throw new NotFoundError('Order not found for UrubutoPay payment', {
        referenceId: entityId,
        referenceType: LogReferenceTypes.ORDER,
      });
    }

    if (!order.referenceId) {
      throw new ValidationError(
        'Order is missing a reference ID required for UrubutoPay payment',
        {
          referenceId: entityId,
          referenceType: LogReferenceTypes.ORDER,
        },
      );
    }

    return order.referenceId;
  }

  private resolvePaymentProvider(provider?: PaymentProvider): PaymentProvider {
    if (provider === PaymentProvider.KPAY) return PaymentProvider.KPAY;

    const configuredProvider = process.env.PAYMENT_PROVIDER_DEFAULT;
    if (configuredProvider === PaymentProvider.KPAY) return PaymentProvider.KPAY;

    return PaymentProvider.URUBUTO;
  }

  private normalizePaymentPhone(phone?: string): string | undefined {
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) return undefined;

    return formattedPhone.replace(/^\+/, '');
  }

  private getPaymentRedirectUrl(orderId: UUID): string {
    const baseUrl =
      this.normalizeBaseUrl(process.env.URUBUTO_CARD_REDIRECT_BASE_URL) ||
      this.normalizeBaseUrl(process.env.FRONTEND_URL);

    if (baseUrl) {
      return `${baseUrl}/p/orders/${orderId}/payment-success`;
    }

    return `https://peekaboo.co.rw/p/orders/${orderId}/payment-success`;
  }

  private validateCardPaymentRedirectUrl(redirectUrl: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(redirectUrl);
    } catch {
      throw new ValidationError(
        'CARD payments require a valid absolute HTTPS FRONTEND_URL',
      );
    }

    if (
      !this.isLocalRedirectHost(parsedUrl.hostname) &&
      parsedUrl.protocol !== 'https:'
    ) {
      throw new ValidationError(
        'CARD payments require a valid absolute HTTPS FRONTEND_URL',
      );
    }
  }

  private isLocalRedirectHost(hostname: string): boolean {
    const normalizedHostname = hostname.toLowerCase();

    return (
      normalizedHostname === 'localhost' ||
      normalizedHostname === '127.0.0.1' ||
      normalizedHostname === '::1' ||
      normalizedHostname.endsWith('.localhost')
    );
  }

  private normalizeBaseUrl(url?: string): string {
    return (url || '').trim().replace(/\/+$/, '');
  }

  private async findUrubutoPayment(
    payload: UrubutoPaymentWebhookPayload,
  ): Promise<Payment | null> {
    const transactionId =
      payload.transaction_id || payload.internal_transaction_id || '';

    if (this.isUuid(transactionId)) {
      const paymentById = await this.paymentRepository.findOne({
        where: { id: transactionId as UUID },
      });

      if (paymentById) return paymentById;
    }

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.provider = :provider', {
        provider: PaymentProvider.URUBUTO,
      });

    const clauses: string[] = [];
    const params: Record<string, string> = {};

    if (transactionId) {
      clauses.push('payment.externalReferenceId = :transactionId');
      clauses.push(
        "payment.metadata ->> 'urubutoInternalTransactionRef' = :transactionId",
      );
      params.transactionId = transactionId;
    }

    if (payload.payer_code) {
      clauses.push("payment.metadata ->> 'payerCode' = :payerCode");
      params.payerCode = payload.payer_code;

      const order = await AppDataSource.getRepository(Order).findOne({
        where: { referenceId: payload.payer_code },
      });

      if (order) {
        clauses.push('payment.entityId = :entityId');
        params.entityId = order.id;
      }
    }

    if (!clauses.length) return null;

    return queryBuilder
      .andWhere(`(${clauses.join(' OR ')})`, params)
      .orderBy('payment.createdAt', 'DESC')
      .getOne();
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
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

  // GET PAYMENT BY ID
  async getPaymentById(id: UUID): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      select: {
        createdBy: true,
      },
      relations: {
        createdBy: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.PAYMENT,
      });
    }

    return payment;
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
