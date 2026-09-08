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
  private readonly kpayService: KpayService;
  private readonly urubutoService: UrubutoService;
  private readonly orderActivityService: OrderActivityService;
  private readonly orderAssignmentService: OrderAssignmentService;
  private readonly emailService: EmailService;
  private readonly whatsappNotificationService: WhatsappNotificationService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.kpayService = new KpayService();
    this.urubutoService = new UrubutoService();
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

    await this.validateUrubutoWallet(context);

    const newPayment = await this.paymentRepository.save(
      this.buildPaymentRecord(payment, context),
    );

    if (context.isSimulated) {
      return this.completeSimulatedPayment(newPayment, payment, context);
    }

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
      const isUrubutoTimeout =
        context.provider === PaymentProvider.URUBUTO &&
        result.error?.code === 'URUBUTO_TIMEOUT';

      if (isUrubutoTimeout) {
        return this.reconcileUrubutoTimeout(newPayment, result);
      }

      // The provider was never reached, so no transaction exists on their side
      // and marking this payment failed is safe. It is an outage, not a bad
      // request: 503 keeps it out of the client-error bucket and tells callers
      // the same request is worth retrying later.
      const isProviderUnreachable =
        result.error?.code === 'PROVIDER_UNREACHABLE';

      newPayment.status = KpayPaymentStatus.FAILED;
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
        'UrubutoPay payment could not be initiated. Please try again.';

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

    const latestOrder = status === KpayPaymentStatus.SUCCESSFUL
      ? await AppDataSource.getRepository(Order).findOne({
          where: { id: payment.entityId },
        })
      : order;

    if (
      status === KpayPaymentStatus.SUCCESSFUL &&
      previousStatus !== KpayPaymentStatus.SUCCESSFUL &&
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
      status === KpayPaymentStatus.SUCCESSFUL &&
      previousStatus !== KpayPaymentStatus.SUCCESSFUL
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
    if (
      !payload.merchant_code ||
      payload.merchant_code !== this.urubutoService.getMerchantCode()
    ) {
      throw new ValidationError('UrubutoPay merchant code does not match');
    }

    if (
      source === 'callback' &&
      payload.callback_type &&
      payload.callback_type !== 'PAYMENT'
    ) {
      throw new ValidationError('Unsupported UrubutoPay callback type');
    }

    const payment = await this.findUrubutoPayment(payload);

    logger.debug('UrubutoPay webhook payment lookup', {
      source,
      transactionId: payload.transaction_id || payload.internal_transaction_id,
      payerCode: payload.payer_code,
      matchedPaymentId: payment?.id,
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    this.validateUrubutoWebhookPayment(payment, payload);

    const inferredStatus =
      source === 'reversal'
        ? UrubutoTransactionStatus.CANCELED
        : payload.transaction_status ||
          (payload.slip_number
            ? UrubutoTransactionStatus.VALID
            : UrubutoTransactionStatus.PENDING_SETTLEMENT);

    const status = this.urubutoService.mapStatusToInternal(inferredStatus);
    const externalReference = this.resolveUrubutoExternalReference(
      payment,
      payload,
      source,
    );
    const nextStatus =
      source !== 'reversal' &&
      status === KpayPaymentStatus.PENDING &&
      (payment.status === KpayPaymentStatus.SUCCESSFUL ||
        payment.status === KpayPaymentStatus.FAILED)
        ? payment.status
        : status;

    payment.externalReferenceId = externalReference;
    await this.paymentRepository.update(payment.id, {
      externalReferenceId: externalReference,
    });

    return this.updatePaymentStatus(payment.id as UUID, nextStatus, {
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


  private resolveInitiationContext(payment: CreatePaymentDto): InitiationContext {
    const mode = getPaymentMode();
    const isSimulated = mode === 'simulate';
    const provider = this.resolvePaymentProvider(payment.provider);
    const requestedMethod =
      payment.channelName ||
      payment.method ||
      payment.metadata?.channelName ||
      (provider === PaymentProvider.URUBUTO
        ? UrubutoChannelName.MOMO
        : KpayPaymentMethod.MOBILE_MONEY);

    const phoneValidation = payment.customerPhone
      ? validateAndFormatPhoneNumber(payment.customerPhone)
      : undefined;
    const customerPhone = phoneValidation?.e164;

    const requiresPhone =
      !isSimulated &&
      (provider === PaymentProvider.KPAY ||
        requestedMethod === UrubutoChannelName.MOMO ||
        requestedMethod === UrubutoChannelName.AIRTEL_MONEY ||
        requestedMethod === KpayPaymentMethod.MOBILE_MONEY);

    if (requiresPhone && !customerPhone) {
      throw new ValidationError('A valid payer phone number is required');
    }

    const requiresMobile =
      !isSimulated &&
      (requestedMethod === UrubutoChannelName.MOMO ||
        requestedMethod === UrubutoChannelName.AIRTEL_MONEY ||
        requestedMethod === KpayPaymentMethod.MOBILE_MONEY);

    if (requiresMobile && phoneValidation?.type !== 'MOBILE') {
      throw new ValidationError(
        'A valid Rwandan mobile number is required for mobile money',
      );
    }

    const { chargeAmount, isDevPrice, catalogAmount, isSimulated: simulated } =
      resolveChargeableAmount(Number(payment.amount));

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
      ...(simulated
        ? {
            simulated: true,
            catalogAmount,
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

    return {
      provider,
      requestedMethod,
      customerPhone,
      chargeAmount,
      catalogAmount,
      isDevPrice,
      isSimulated: simulated,
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
      status: KpayPaymentStatus.PENDING,
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
      KpayPaymentStatus.SUCCESSFUL,
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
    if (context.provider === PaymentProvider.KPAY) {
      return this.kpayService.initiatePayment({
        amount: context.chargeAmount,
        currency: payment.currency,
        customerEmail: payment?.customerEmail,
        customerName: payment?.customerName,
        customerPhone: context.customerPhone,
        refId: newPayment?.id as UUID,
        description: payment.description,
      });
    }

    const payerCode = await this.resolveUrubutoPayerCode(payment.entityId);
    const redirectUrl = this.getPaymentPendingUrl(
      payment.entityId,
      newPayment.id,
    );

    if (context.requestedMethod === UrubutoChannelName.CARD) {
      this.validateCardPaymentRedirectUrl(redirectUrl);
      logger.debug('Resolved CARD payment redirect URL', {
        entityId: payment.entityId,
        paymentId: newPayment.id,
        provider: context.provider,
        channelName: context.requestedMethod,
        redirectUrl,
      });
    }

    return this.urubutoService.initiatePayment({
      amount: context.chargeAmount,
      currency: payment.currency,
      customerEmail: payment?.customerEmail,
      customerName: payment?.customerName,
      customerPhone: context.customerPhone,
      refId: newPayment?.id as UUID,
      payerCode,
      channelName: context.requestedMethod,
      redirectUrl,
    });
  }

  private async validateUrubutoWallet(
    context: InitiationContext,
  ): Promise<void> {
    if (
      context.isSimulated ||
      context.provider !== PaymentProvider.URUBUTO ||
      (context.requestedMethod !== UrubutoChannelName.MOMO &&
        context.requestedMethod !== UrubutoChannelName.AIRTEL_MONEY)
    ) {
      return;
    }

    if (!context.customerPhone) {
      throw new ValidationError('A valid payer phone number is required');
    }

    const result = await this.urubutoService.validateAccountHolder({
      customerPhone: context.customerPhone,
      channelName: context.requestedMethod,
    });

    if (!result.success) {
      throw new AppError(
        result.error?.message ||
          'We could not verify this mobile money account. Please try again.',
        503,
      );
    }

    if (!result.valid) {
      const providerName =
        context.requestedMethod === UrubutoChannelName.AIRTEL_MONEY
          ? 'Airtel Money'
          : 'MTN Mobile Money';
      throw new ValidationError(
        result.message ||
          `This phone number is not registered for ${providerName}. Check the number or choose the correct network.`,
      );
    }
  }

  private async applyInitiationResult(
    newPayment: Payment,
    result: any,
  ): Promise<void> {
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
        newPayment.id as UUID,
        result.data?.status as KpayPaymentStatus,
      );
    }
  }

  private async reconcileUrubutoTimeout(
    newPayment: Payment,
    result: any,
  ): Promise<Payment> {
    const timeoutMetadata = result.error?.metadata || {};
    const transactionId =
      timeoutMetadata.transactionId ||
      timeoutMetadata.localPaymentId ||
      newPayment.id;
    const verification =
      await this.verifyUrubutoTransactionStatus(transactionId as string);
    const verifiedTransactionId =
      verification.data?.internal_transaction_id ||
      verification.data?.transaction_id ||
      transactionId;

    // A provider status lookup helps correlate a timed-out request, but only
    // an authenticated UrubutoPay webhook may complete the payment.
    newPayment.status = KpayPaymentStatus.PENDING;
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

    return newPayment;
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

  private getPaymentPendingUrl(orderId: UUID, paymentId: UUID): string {
    const baseUrl =
      this.normalizeBaseUrl(process.env.URUBUTO_CARD_REDIRECT_BASE_URL) ||
      this.normalizeBaseUrl(process.env.FRONTEND_URL);

    if (baseUrl) {
      return `${baseUrl}/p/orders/${orderId}/payment-pending?paymentId=${paymentId}`;
    }

    return `https://peekaboo.co.rw/p/orders/${orderId}/payment-pending?paymentId=${paymentId}`;
  }

  private validateUrubutoWebhookPayment(
    payment: Payment,
    payload: UrubutoPaymentWebhookPayload,
  ): void {
    if (payload.amount !== undefined) {
      const webhookAmount = Number(payload.amount);
      if (
        !Number.isFinite(webhookAmount) ||
        Math.abs(webhookAmount - Number(payment.amount)) > 0.001
      ) {
        throw new ValidationError('UrubutoPay webhook amount does not match');
      }
    }

    if (
      payload.currency &&
      payload.currency.toUpperCase() !== payment.currency.toUpperCase()
    ) {
      throw new ValidationError('UrubutoPay webhook currency does not match');
    }

    const expectedPayerCode = payment.metadata?.payerCode;
    if (
      expectedPayerCode &&
      payload.payer_code &&
      payload.payer_code !== expectedPayerCode
    ) {
      throw new ValidationError('UrubutoPay webhook payer code does not match');
    }
  }

  private resolveUrubutoExternalReference(
    payment: Payment,
    payload: UrubutoPaymentWebhookPayload,
    source: 'callback' | 'notification' | 'reversal',
  ): string | undefined {
    if (payload.internal_transaction_id) {
      return payload.internal_transaction_id;
    }

    if (payment.externalReferenceId) {
      return payment.externalReferenceId;
    }

    if (
      payload.transaction_id &&
      (source !== 'callback' || payload.transaction_id !== payment.id)
    ) {
      return payload.transaction_id;
    }

    return undefined;
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
