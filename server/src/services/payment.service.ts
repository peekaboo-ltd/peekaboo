import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AppDataSource } from '../data-source';
import { Payment } from '../entities/payment.entity';
import {
  CreatePaymentDto,
  PublicPaymentStatusDto,
} from '../types/payment.types';
import { PaymentStatus } from '../types/payment-status.types';
import {
  PAYPACK_TIMEOUT,
  PROVIDER_UNREACHABLE,
  PaypackService,
} from '../integrations/paypack/paypack.service';
import { PAYPACK_MIN_CASHIN_RWF } from '../integrations/paypack/paypack.config';
import {
  PaymentProvider,
  PaypackChannel,
  PaypackWebhookPayload,
} from '../types/paypack.types';
import { Request } from 'express';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { UUID } from '../types';
import { PaymentType } from '../constants/payment.constants';
import {
  AppError,
  NotFoundError,
  ValidationError,
} from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { OrderActivityService } from './orderActivity.service';
import { OrderActivityStatus, OrderStatus } from '../constants/order.constants';
import { OrderActivity } from '../entities/orderActivity.entity';
import { OrderAssignmentService } from './orderAssignment.service';
import { EmailService } from '../integrations/emails/email.service';
import { Order } from '../entities/order.entity';
import { Conversation } from '../entities/conversation.entity';
import { AuditCreate, AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';
import {
  formatPhoneForPaypack,
  validateAndFormatPhoneNumber,
} from '../helpers/phone.helper';
import { ConversationStatus } from '../constants/conversation.constants';
import logger from '../helpers/logger.helper';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  getPaymentMode,
  resolveChargeableAmount,
} from '../helpers/paymentMode.helper';
import { WhatsappNotificationService } from './whatsappNotification.service';
import { PendingOrderSession } from '../entities/pendingOrderSession.entity';
import { PendingOrderSessionStatus } from '../constants/pendingOrderSession.constants';

type InitiationContext = {
  provider: PaymentProvider;
  requestedMethod: string;
  customerPhone?: string;
  chargeAmount: number;
  catalogAmount: number;
  isDevPrice: boolean;
  isSimulated: boolean;
  metadata: Record<string, any>;
};

export class PaymentService {
  private readonly paymentRepository: Repository<Payment>;
  private readonly paypackService: PaypackService;
  private readonly orderActivityService: OrderActivityService;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly emailService: EmailService;
  private readonly whatsappNotificationService: WhatsappNotificationService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.paypackService = new PaypackService();
    this.orderActivityService = new OrderActivityService();
    this.orderAssignmentService = new OrderAssignmentService();
    this.emailService = new EmailService();
    this.whatsappNotificationService = new WhatsappNotificationService();
  }


  // CREATE PAYMENT
  @AuditCreate({
    entityType: AuditLogEntityTypes.PAYMENT,
  })
  async createPayment(payment: CreatePaymentDto): Promise<Payment> {
    const context = this.resolveInitiationContext(payment);

    const newPayment = await this.paymentRepository.save(
      this.buildPaymentRecord(payment, context),
    );

    if (context.isSimulated) {
      return this.completeSimulatedPayment(newPayment, payment, context);
    }

    logger.debug('Initiating provider payment payload', {
      paymentId: newPayment.id,
      entityId: payment.entityId,
      provider: context.provider,
      channelName: context.requestedMethod,
      chargeAmount: context.chargeAmount,
      catalogAmount: context.catalogAmount,
      isDevPrice: context.isDevPrice,
      isSimulated: context.isSimulated,
      phoneNumber: context.customerPhone,
      phoneNumberFormatted: formatPhoneForPaypack(context.customerPhone),
    });

    const result = await this.initiateProviderPayment(
      payment,
      newPayment,
      context,
    );

    logger.debug('Payment initiation result', {
      entityId: payment.entityId,
      provider: context.provider,
      channelName: context.requestedMethod,
      success: result?.success,
      status: result?.data?.status,
      errorCode: result?.error?.code,
      errorMessage: result?.error?.message,
    });

    if (result?.success && result.data?.transactionId) {
      await this.applyInitiationResult(newPayment, result);
      this.sendPaymentInitiatedEmail(payment, context.chargeAmount);
      return newPayment;
    }

    if (result && !result.success) {
      if (result.error?.code === PAYPACK_TIMEOUT) {
        return this.reconcilePaypackTimeout(newPayment, payment, context, result);
      }

      // The provider was never reached, so no transaction exists on their side
      // and marking this payment failed is safe. It is an outage, not a bad
      // request: 503 keeps it out of the client-error bucket and tells callers
      // the same request is worth retrying later.
      const isProviderUnreachable =
        result.error?.code === PROVIDER_UNREACHABLE;

      newPayment.status = PaymentStatus.FAILED;
      newPayment.metadata = {
        ...(newPayment.metadata || {}),
        initiationError: result.error,
      };
      await this.paymentRepository.update(newPayment.id, {
        status: newPayment.status,
        metadata: newPayment.metadata,
      });

      const failureMessage =
        result.error?.message ||
        'Paypack payment could not be initiated. Please try again.';

      throw isProviderUnreachable
        ? new AppError(failureMessage, 503)
        : new ValidationError(failureMessage);
    }

    this.sendPaymentInitiatedEmail(payment, context.chargeAmount);
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
      condition.status = status as PaymentStatus;
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

  async getPublicPaymentStatus(
    paymentId: UUID,
    entityId: UUID,
  ): Promise<PublicPaymentStatusDto> {
    const payment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
        entityId,
        type: PaymentType.ORDER,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return {
      id: payment.id,
      entityId: payment.entityId,
      status: payment.status,
      provider: payment.provider,
      method: payment.method,
      amount: Number(payment.amount),
      currency: payment.currency,
      externalReferenceId: payment.externalReferenceId,
      updatedAt: payment.updatedAt,
    };
  }

  // UPDATE PAYMENT STATUS
  @AuditUpdate({
    entityType: AuditLogEntityTypes.PAYMENT,
    getEntityId: (args) => args[0],
  })
  async updatePaymentStatus(
    paymentId: UUID,
    status: PaymentStatus,
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
      status === PaymentStatus.SUCCESSFUL &&
      (await this.isWhatsappSessionExpired(existingMetadata));

    payment.status = status as PaymentStatus;
    payment.metadata = {
      ...existingMetadata,
      ...(metadata || {}),
      ...(paidAfterWhatsappSessionExpired
        ? { paidAfterWhatsappSessionExpired: true }
        : {}),
    };
    await this.paymentRepository.update(payment?.id as UUID, payment);

    const latestOrder = status === PaymentStatus.SUCCESSFUL
      ? await AppDataSource.getRepository(Order).findOne({
          where: { id: payment.entityId },
        })
      : order;

    if (
      status === PaymentStatus.SUCCESSFUL &&
      previousStatus !== PaymentStatus.SUCCESSFUL &&
      latestOrder?.status === OrderStatus.CANCELLED
    ) {
      payment.metadata = {
        ...(payment.metadata || {}),
        lateSuccessfulPaymentRequiresManualReconciliation: true,
        lateSuccessfulPaymentRecordedAt: new Date().toISOString(),
      };
      await this.paymentRepository.update(payment.id, { metadata: payment.metadata });
      this.whatsappNotificationService.notifyLatePayment(payment).catch((error) =>
        logger.error('Failed to notify payer about late payment', error),
      );
      return payment;
    }

    if (paidAfterWhatsappSessionExpired && existingMetadata.conversationId) {
      await AppDataSource.getRepository(Conversation).update(
        { id: existingMetadata.conversationId as UUID },
        { status: ConversationStatus.ACTIVE },
      );
    }

    if (
      status === PaymentStatus.SUCCESSFUL &&
      previousStatus !== PaymentStatus.SUCCESSFUL
    ) {
      const whatsappSessionId = payment.metadata?.whatsappBookingSessionId as UUID | undefined;
      if (whatsappSessionId) {
        await AppDataSource.getRepository(PendingOrderSession).update(
          { id: whatsappSessionId },
          { status: PendingOrderSessionStatus.PAID },
        );
      }
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
      this.whatsappNotificationService.notifyOrderPaid(payment).catch((error) =>
        logger.error('Failed to send WhatsApp paid notification', error),
      );
    }

    if (
      status === PaymentStatus?.FAILED &&
      previousStatus !== PaymentStatus.FAILED &&
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
        .catch((error: any) => {
          logger.error('Failed to send payment failed email', {
            paymentId: payment?.id,
            customerEmail: payment?.customerEmail,
            message: error?.message,
          });
        });
    }

    return payment;
  }

  // Signature verification itself happens in the webhook controller, which
  // rejects forged payloads before this runs.
  async processPaypackWebhook(payload: PaypackWebhookPayload): Promise<Payment> {
    if (payload.kind !== 'transaction:processed' || !payload.data) {
      throw new ValidationError('Unsupported Paypack webhook event');
    }

    const data = payload.data;
    const payment = await this.paymentRepository.findOne({
      where: { externalReferenceId: data.ref },
    });

    logger.debug('Paypack webhook payment lookup', {
      ref: data.ref,
      transactionStatus: data.status,
      matchedPaymentId: payment?.id,
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (
      data.amount !== undefined &&
      (!Number.isFinite(Number(data.amount)) ||
        Math.abs(Number(data.amount) - Number(payment.amount)) > 0.001)
    ) {
      throw new ValidationError('Paypack webhook amount does not match');
    }

    const status = this.paypackService.mapStatusToInternal(data.status);
    // Never let a late "pending" event reopen a terminal payment.
    const nextStatus =
      status === PaymentStatus.PENDING &&
      (payment.status === PaymentStatus.SUCCESSFUL ||
        payment.status === PaymentStatus.FAILED)
        ? payment.status
        : status;

    return this.updatePaymentStatus(payment.id as UUID, nextStatus, {
      paypackWebhookPayload: payload,
      paypackLastStatus: data.status,
      paypackProcessedAt: data.processed_at,
      paypackFee: data.fee,
      paypackProvider: data.provider,
      paypackLastWebhookAt: new Date().toISOString(),
    });
  }

  async verifyPaypackTransactionStatus(ref: string) {
    const lookup = await this.paypackService.findTransaction(ref);
    if (!lookup.success || !lookup.data) {
      throw new NotFoundError(lookup.error?.message || 'Transaction not found');
    }
    return {
      status: this.paypackService.mapStatusToInternal(lookup.data.status),
      data: lookup.data,
    };
  }


  private resolveInitiationContext(payment: CreatePaymentDto): InitiationContext {
    const mode = getPaymentMode();
    const isSimulated = mode === 'simulate';
    const provider = PaymentProvider.PAYPACK;
    const requestedMethod =
      payment.channelName || payment.method || payment.metadata?.channelName || PaypackChannel.MOMO;

    if (
      !Object.values(PaypackChannel).includes(requestedMethod as PaypackChannel)
    ) {
      throw new ValidationError(
        'Unsupported payment channel. Choose MTN Mobile Money or Airtel Money.',
      );
    }

    const phoneValidation = payment.customerPhone
      ? validateAndFormatPhoneNumber(payment.customerPhone)
      : undefined;
    const customerPhone = phoneValidation?.e164;

    if (!isSimulated && !customerPhone) {
      throw new ValidationError('A valid payer phone number is required');
    }

    if (!isSimulated && phoneValidation?.type !== 'MOBILE') {
      throw new ValidationError(
        'A valid Rwandan mobile number is required for mobile money',
      );
    }

    const { chargeAmount, isDevPrice, catalogAmount, isSimulated: simulated } =
      resolveChargeableAmount(Number(payment.amount));

    // Paypack cashin rejects amounts below its minimum. Never charge a
    // different amount than displayed, so complete these as simulated and say
    // so in the metadata (affects dev_price mode, which charges 10 RWF).
    const belowProviderMinimum =
      !simulated && chargeAmount < PAYPACK_MIN_CASHIN_RWF;

    const metadata: Record<string, any> = {
      ...(payment.metadata || {}),
      paymentMode: mode,
      ...(isDevPrice
        ? {
            developmentPricing: true,
            catalogAmount,
            chargedAmount: DEVELOPMENT_PAYMENT_AMOUNT_RWF,
          }
        : {}),
      ...(simulated || belowProviderMinimum
        ? {
            simulated: true,
            catalogAmount,
          }
        : {}),
      ...(belowProviderMinimum
        ? {
            paypackMinimumNotMet: true,
            paypackMinimum: PAYPACK_MIN_CASHIN_RWF,
          }
        : {}),
    };

    if (isDevPrice) {
      logger.info('Dev price applied to payment', {
        entityId: payment.entityId,
        catalogAmount,
        chargeAmount,
      });
    }

    if (belowProviderMinimum) {
      logger.info('Charge below Paypack minimum, completing as simulated', {
        entityId: payment.entityId,
        chargeAmount,
        minimum: PAYPACK_MIN_CASHIN_RWF,
      });
    }

    return {
      provider,
      requestedMethod,
      customerPhone,
      chargeAmount,
      catalogAmount,
      isDevPrice,
      isSimulated: simulated || belowProviderMinimum,
      metadata,
    };
  }

  private buildPaymentRecord(
    payment: CreatePaymentDto,
    context: InitiationContext,
  ): Partial<Payment> {
    return {
      idempotencyKey: payment.idempotencyKey,
      entityId: payment.entityId,
      amount: context.chargeAmount,
      externalReferenceId: undefined,
      internalReferenceId: payment?.entityId,
      status: PaymentStatus.PENDING,
      customerEmail: payment?.customerEmail,
      customerName: payment?.customerName,
      customerPhone: context.customerPhone,
      currency: payment.currency,
      type: payment.type,
      description: payment.description || '',
      createdById: payment.createdById,
      provider: context.provider,
      method: context.requestedMethod,
      metadata: context.metadata,
    };
  }

  private async completeSimulatedPayment(
    newPayment: Payment,
    payment: CreatePaymentDto,
    context: InitiationContext,
  ): Promise<Payment> {
    const paymentUrl = this.getPaymentPendingUrl(payment.entityId, newPayment.id);
    const externalReferenceId = `sim_${newPayment.id}`;

    newPayment.externalReferenceId = externalReferenceId;
    newPayment.paymentUrl = paymentUrl;
    newPayment.metadata = {
      ...(newPayment.metadata || {}),
      simulated: true,
      catalogAmount: context.catalogAmount,
      paymentUrl,
      paymentMode: 'simulate',
    };

    await this.paymentRepository.update(newPayment.id, {
      externalReferenceId,
      metadata: newPayment.metadata,
    });

    logger.info('Simulated payment completed', {
      paymentId: newPayment.id,
      entityId: payment.entityId,
      catalogAmount: context.catalogAmount,
    });

    const updated = await this.updatePaymentStatus(
      newPayment.id as UUID,
      PaymentStatus.SUCCESSFUL,
      newPayment.metadata,
    );

    updated.paymentUrl = paymentUrl;
    updated.externalReferenceId = externalReferenceId;
    this.sendPaymentInitiatedEmail(payment, context.chargeAmount);
    return updated;
  }

  private async initiateProviderPayment(
    payment: CreatePaymentDto,
    newPayment: Payment,
    context: InitiationContext,
  ): Promise<any> {
    const localNumber = formatPhoneForPaypack(context.customerPhone);
    if (!localNumber) {
      return {
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'A valid Rwandan mobile number is required for mobile money',
        },
      };
    }

    return this.paypackService.cashin({
      amount: context.chargeAmount,
      currency: payment.currency,
      customerPhone: localNumber,
      refId: newPayment?.id as UUID,
      // UUID hex is exactly 32 chars, the max Idempotency-Key length, so a
      // retried cashin for the same payment can never double-charge.
      idempotencyKey: String(newPayment?.id).replace(/-/g, ''),
      channel: context.requestedMethod as PaypackChannel,
    });
  }

  private async applyInitiationResult(
    newPayment: Payment,
    result: any,
  ): Promise<void> {
    newPayment.externalReferenceId = result.data?.transactionId;
    newPayment.status = result.data?.status as PaymentStatus;
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

    if (result.data?.status === PaymentStatus.SUCCESSFUL) {
      await this.updatePaymentStatus(
        newPayment.id as UUID,
        result.data?.status as PaymentStatus,
      );
    }
  }

  // The cashin POST timed out, so a transaction may or may not exist at
  // Paypack. First look for a transaction the timed-out request may have
  // created, then retry once with the same idempotency key (Paypack rejects
  // the duplicate instead of double-charging). Either way the payment stays
  // PENDING and the webhook settles it.
  private async reconcilePaypackTimeout(
    newPayment: Payment,
    payment: CreatePaymentDto,
    context: InitiationContext,
    result: any,
  ): Promise<Payment> {
    const reconciliation: Record<string, any> = {
      checkedAt: new Date().toISOString(),
      initiationError: result.error,
    };

    const adopted = await this.adoptTimedOutTransaction(newPayment, context);
    if (adopted) {
      reconciliation.adoptedRef = adopted;
      newPayment.status = PaymentStatus.PENDING;
      newPayment.externalReferenceId = adopted;
    } else {
      const retry = await this.initiateProviderPayment(payment, newPayment, context);
      reconciliation.retry = { success: retry?.success, error: retry?.error };
      if (retry?.success && retry.data?.transactionId) {
        await this.applyInitiationResult(newPayment, retry);
        this.sendPaymentInitiatedEmail(payment, context.chargeAmount);
        newPayment.metadata = {
          ...(newPayment.metadata || {}),
          paypackTimeoutReconciliation: reconciliation,
        };
        await this.paymentRepository.update(newPayment.id, {
          metadata: newPayment.metadata,
        });
        return newPayment;
      }
      newPayment.status = PaymentStatus.PENDING;
    }

    newPayment.metadata = {
      ...(newPayment.metadata || {}),
      initiationError: result.error,
      paypackTimeoutReconciliation: reconciliation,
    };

    await this.paymentRepository.update(newPayment.id, {
      externalReferenceId: newPayment.externalReferenceId,
      status: newPayment.status,
      metadata: newPayment.metadata,
    });

    return newPayment;
  }

  // Find a CASHIN for our number+amount created in the last 15 minutes and
  // adopt its ref when the timed-out cashin never returned one.
  private async adoptTimedOutTransaction(
    newPayment: Payment,
    context: InitiationContext,
  ): Promise<string | undefined> {
    try {
      const localNumber = formatPhoneForPaypack(context.customerPhone);
      if (!localNumber) return undefined;
      const listing = await this.paypackService.listTransactions({
        limit: 20,
        offset: 0,
        kind: 'CASHIN',
        client: localNumber,
      });
      const candidates = listing.data?.transactions || [];
      const cutoff = Date.now() - 15 * 60_000;
      const match = candidates.find(
        (tx: any) =>
          Number(tx.amount) === Number(newPayment.amount) &&
          Date.parse(tx.timestamp) >= cutoff,
      );
      return match?.ref;
    } catch (error) {
      logger.error('Paypack timeout reconciliation lookup failed', {
        paymentId: newPayment.id,
        message: (error as any)?.message,
      });
      return undefined;
    }
  }

  private sendPaymentInitiatedEmail(
    payment: CreatePaymentDto,
    chargeAmount: number,
  ): void {
    if (!payment.customerEmail) return;

    this.emailService
      .sendPaymentInitiatedEmail({
        customerName: payment.customerName || '',
        customerEmail: payment.customerEmail,
        orderReference: payment.entityId as string,
        amount: chargeAmount,
        currency: payment.currency || 'RWF',
      })
      .catch((error: any) => {
        logger.error('Failed to send payment initiated email', {
          entityId: payment.entityId,
          customerEmail: payment.customerEmail,
          message: error?.message,
        });
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

  private getPaymentPendingUrl(orderId: UUID, paymentId: UUID): string {
    const baseUrl = this.normalizeBaseUrl(process.env.FRONTEND_URL);

    if (baseUrl) {
      return `${baseUrl}/p/orders/${orderId}/payment-pending?paymentId=${paymentId}`;
    }

    return `https://peekaboo.co.rw/p/orders/${orderId}/payment-pending?paymentId=${paymentId}`;
  }

  private normalizeBaseUrl(url?: string): string {
    return (url || '').trim().replace(/\/+$/, '');
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
        pending: PaymentStatus.PENDING,
        successful: PaymentStatus.SUCCESSFUL,
        failed: PaymentStatus.FAILED,
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
    status: PaymentStatus,
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
