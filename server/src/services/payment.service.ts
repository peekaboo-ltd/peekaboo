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

export class PaymentService {
  private readonly paymentRepository: Repository<Payment>;
  private readonly kpayService: KpayService;
  private readonly orderActivityService: OrderActivityService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.kpayService = new KpayService();
    this.orderActivityService = new OrderActivityService();
  }

  // CREATE PAYMENT
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
      await this.paymentRepository.update(newPayment.id, newPayment);
      return newPayment;
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
  async updatePaymentStatus(
    paymentId: UUID,
    status: KpayPaymentStatus
  ): Promise<Payment> {

    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundError('Payment not found', {
        referenceId: paymentId,
        referenceType: LogReferenceTypes.PAYMENT,
      });
    }

    payment.status = status as KpayPaymentStatus;
    const updatedPayment = await this.paymentRepository.update(payment.id, payment);

    let orderActivity: OrderActivity | undefined;
    if (status === KpayPaymentStatus.SUCCESSFUL) {
      orderActivity = await this.orderActivityService.createOrderActivity({
        orderId: payment?.entityId,
        status: OrderStatus.PAID,
        notes: payment?.externalReferenceId ?? undefined,
        createdById: payment?.createdById ?? undefined,
      });
    }

    return payment;
  }
}
