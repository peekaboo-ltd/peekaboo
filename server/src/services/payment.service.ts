import { FindOptionsWhere, Repository } from 'typeorm';
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

export class PaymentService {
  private readonly paymentRepository: Repository<Payment>;
  private readonly kpayService: KpayService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.kpayService = new KpayService();
  }

  // CREATE PAYMENT
  async createPayment(payment: CreatePaymentDto): Promise<Payment> {
    const result = await this.kpayService.initiatePayment({
      amount: payment.amount,
      currency: payment.currency,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName,
      customerPhone: payment.customerPhone,
      refId: payment.entityId,
      description: payment.description,
    });

    if (!result.success) {
      throw new Error(result.error?.message ?? 'Payment initiation failed');
    }

    const newPayment = await this.paymentRepository.save({
      ...payment,
      amount: Number(payment.amount),
      externalReferenceId: result.data?.transactionId ?? undefined,
      internalReferenceId: result.data?.reference ?? undefined,
      status: result.data?.status as KpayPaymentStatus,
    });

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

    const payments = await this.paymentRepository.findAndCount({
      where: condition,
      skip,
      take,
    });

    return getPagingData({
      data: payments,
      page: Number(page),
      size: Number(size),
    });
  }
}
