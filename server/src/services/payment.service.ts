import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { kpayService } from './kpay.service';
import { PaymentType } from '../constants/payment.constants';
import { 
  KpayPaymentStatus, 
  KpayWebhookPayload,
  KpayPaymentMethod 
} from '../types/kpay.types';
import { UUID } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  private paymentRepository: Repository<Payment>;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
  }

  /**
   * Create a new payment and initiate with Kpay
   */
  async createPayment(params: {
    entityId: UUID;
    amount: number;
    currency: 'RWF' | 'USD';
    type: PaymentType;
    description?: string;
    userId: UUID;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      // Generate internal reference ID
      const internalReferenceId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create payment record with pending status
      const payment = this.paymentRepository.create({
        id: uuidv4(),
        entityId: params.entityId,
        internalReferenceId,
        amount: params.amount,
        currency: params.currency,
        type: params.type,
        status: KpayPaymentStatus.PENDING,
        description: params.description,
        method: 'PENDING', // Will be updated when payment is completed
        createdById: params.userId,
        kpayTransactionId: null,
        kpayReference: null,
        paymentUrl: null,
        expiresAt: null,
        metadata: params.metadata
      });

      // Save initial payment record
      const savedPayment = await this.paymentRepository.save(payment);

      // Initiate payment with Kpay
      const kpayResponse = await kpayService.initiatePayment({
        amount: params.amount,
        currency: params.currency,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        orderId: internalReferenceId,
        description: params.description,
        metadata: {
          ...params.metadata,
          paymentId: savedPayment.id,
          entityId: params.entityId,
          type: params.type
        }
      });

      if (kpayResponse.success && kpayResponse.data) {
        // Update payment with Kpay response
        await this.paymentRepository.update(savedPayment.id, {
          externalReferenceId: kpayResponse.data.transactionId,
          kpayTransactionId: kpayResponse.data.transactionId,
          kpayReference: kpayResponse.data.reference,
          paymentUrl: kpayResponse.data.paymentUrl,
          expiresAt: kpayResponse.data.expiresAt,
          status: kpayResponse.data.status
        });

        return {
          success: true,
          payment: await this.getPaymentById(savedPayment.id),
          paymentUrl: kpayResponse.data.paymentUrl
        };
      } else {
        // Update payment status to failed
        await this.paymentRepository.update(savedPayment.id, {
          status: KpayPaymentStatus.FAILED,
          failureReason: kpayResponse.error?.message
        });

        return {
          success: false,
          error: kpayResponse.error,
          payment: await this.getPaymentById(savedPayment.id)
        };
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Handle Kpay webhook
   */
  async handleKpayWebhook(payload: KpayWebhookPayload) {
    try {
      // Verify webhook signature
      if (!kpayService.verifyWebhookSignature(payload)) {
        throw new Error('Invalid webhook signature');
      }

      // Find payment by internal reference or transaction ID
      const payment = await this.paymentRepository.findOne({
        where: [
          { internalReferenceId: payload.data.reference },
          { kpayTransactionId: payload.data.transactionId }
        ]
      });

      if (!payment) {
        console.error('Payment not found for webhook:', payload.data);
        return { success: false, error: 'Payment not found' };
      }

      // Update payment based on webhook event
      const updateData: Partial<Payment> = {
        status: payload.data.status,
        lastWebhookEvent: payload.event,
        lastWebhookAt: new Date()
      };

      if (payload.data.status === KpayPaymentStatus.SUCCESSFUL) {
        updateData.paidAt = payload.data.paidAt || new Date();
        updateData.method = this.mapKpayMethodToInternal(payload.data.paymentMethod);
        updateData.payerInfo = payload.data.customerInfo;
      } else if (payload.data.status === KpayPaymentStatus.FAILED) {
        updateData.failedAt = new Date();
        updateData.failureReason = 'Payment failed';
      }

      await this.paymentRepository.update(payment.id, updateData);

      // Handle post-payment actions based on payment type
      await this.handlePostPaymentActions(payment, payload.data.status);

      return { success: true, payment: await this.getPaymentById(payment.id) };
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: UUID) {
    try {
      const payment = await this.getPaymentById(paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (!payment.kpayTransactionId) {
        return { payment, updated: false };
      }

      // Get latest status from Kpay
      const kpayStatus = await kpayService.getPaymentStatus(payment.kpayTransactionId);
      
      if (!kpayStatus) {
        return { payment, updated: false };
      }

      // Update if status changed
      if (kpayStatus.status !== payment.status) {
        const updateData: Partial<Payment> = {
          status: kpayStatus.status,
          lastStatusCheck: new Date()
        };

        if (kpayStatus.status === KpayPaymentStatus.SUCCESSFUL && !payment.paidAt) {
          updateData.paidAt = kpayStatus.paidAt || new Date();
          updateData.method = this.mapKpayMethodToInternal(kpayStatus.paymentMethod);
          updateData.payerInfo = kpayStatus.customerInfo;
        } else if (kpayStatus.status === KpayPaymentStatus.FAILED && !payment.failedAt) {
          updateData.failedAt = kpayStatus.failedAt || new Date();
          updateData.failureReason = kpayStatus.failureReason;
        }

        await this.paymentRepository.update(payment.id, updateData);
        
        // Handle post-payment actions
        await this.handlePostPaymentActions(payment, kpayStatus.status);

        return { 
          payment: await this.getPaymentById(paymentId), 
          updated: true 
        };
      }

      return { payment, updated: false };
    } catch (error: any) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: UUID, amount?: number, reason?: string) {
    try {
      const payment = await this.getPaymentById(paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== KpayPaymentStatus.SUCCESSFUL) {
        throw new Error('Can only refund successful payments');
      }

      if (!payment.kpayTransactionId) {
        throw new Error('No Kpay transaction ID found');
      }

      // Process refund with Kpay
      const refundResponse = await kpayService.processRefund({
        transactionId: payment.kpayTransactionId,
        amount: amount,
        reason: reason || 'Refund requested'
      });

      if (refundResponse.success && refundResponse.data) {
        // Update payment status
        const newStatus = amount && amount < payment.amount 
          ? KpayPaymentStatus.PARTIALLY_REFUNDED 
          : KpayPaymentStatus.REFUNDED;

        await this.paymentRepository.update(payment.id, {
          status: newStatus,
          refundId: refundResponse.data.refundId,
          refundedAmount: amount || payment.amount,
          refundedAt: refundResponse.data.processedAt || new Date(),
          refundReason: reason
        });

        return {
          success: true,
          payment: await this.getPaymentById(paymentId),
          refund: refundResponse.data
        };
      } else {
        return {
          success: false,
          error: refundResponse.error,
          payment
        };
      }
    } catch (error: any) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: UUID): Promise<Payment | null> {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ['createdBy']
    });
  }

  /**
   * Get payments by entity
   */
  async getPaymentsByEntity(entityId: UUID, type?: PaymentType) {
    const query = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.createdBy', 'createdBy')
      .where('payment.entityId = :entityId', { entityId })
      .orderBy('payment.createdAt', 'DESC');

    if (type) {
      query.andWhere('payment.type = :type', { type });
    }

    return await query.getMany();
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(params: {
    entityId?: UUID;
    type?: PaymentType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.paymentRepository.createQueryBuilder('payment');

    if (params.entityId) {
      query.andWhere('payment.entityId = :entityId', { entityId: params.entityId });
    }

    if (params.type) {
      query.andWhere('payment.type = :type', { type: params.type });
    }

    if (params.startDate) {
      query.andWhere('payment.createdAt >= :startDate', { startDate: params.startDate });
    }

    if (params.endDate) {
      query.andWhere('payment.createdAt <= :endDate', { endDate: params.endDate });
    }

    const totalPayments = await query.getCount();
    
    const successfulPayments = await query
      .clone()
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .getCount();

    const totalAmount = await query
      .clone()
      .andWhere('payment.status = :status', { status: KpayPaymentStatus.SUCCESSFUL })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    return {
      totalPayments,
      successfulPayments,
      failedPayments: totalPayments - successfulPayments,
      totalAmount: totalAmount?.total || 0,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0
    };
  }

  /**
   * Map Kpay payment method to internal method
   */
  private mapKpayMethodToInternal(kpayMethod?: string): string {
    if (!kpayMethod) return 'UNKNOWN';

    const methodMap: Record<string, string> = {
      [KpayPaymentMethod.MTN_MOMO]: 'MTN_MOBILE_MONEY',
      [KpayPaymentMethod.AIRTEL_MONEY]: 'AIRTEL_MONEY',
      [KpayPaymentMethod.VISA]: 'VISA_CARD',
      [KpayPaymentMethod.MASTERCARD]: 'MASTERCARD',
      [KpayPaymentMethod.BANK_TRANSFER]: 'BANK_TRANSFER',
      [KpayPaymentMethod.MOBILE_MONEY]: 'MOBILE_MONEY',
      [KpayPaymentMethod.CARD]: 'CARD'
    };

    return methodMap[kpayMethod] || kpayMethod;
  }

  /**
   * Handle post-payment actions based on payment type and status
   */
  private async handlePostPaymentActions(payment: Payment, status: KpayPaymentStatus) {
    try {
      if (status === KpayPaymentStatus.SUCCESSFUL) {
        switch (payment.type) {
          case PaymentType.ORDER:
            // Update order status to paid
            // This would integrate with your order service
            console.log(`Order ${payment.entityId} payment successful`);
            break;
          
          default:
            console.log(`Payment ${payment.id} successful for type ${payment.type}`);
        }
      } else if (status === KpayPaymentStatus.FAILED) {
        // Handle failed payment actions
        console.log(`Payment ${payment.id} failed for entity ${payment.entityId}`);
      }
    } catch (error) {
      console.error('Post-payment action error:', error);
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();