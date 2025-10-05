import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { 
  KpayConfig, 
  KpayPaymentRequest, 
  KpayPaymentResponse, 
  KpayTransactionStatus,
  KpayWebhookPayload,
  KpayRefundRequest,
  KpayRefundResponse
} from '../types/kpay.types';

export class KpayService {
  private readonly client: AxiosInstance;
  private readonly config: KpayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.KPAY_API_KEY || '',
      secretKey: process.env.KPAY_SECRET_KEY || '',
      baseUrl: process.env.KPAY_BASE_URL || 'https://api.kpay.rw',
      merchantId: process.env.KPAY_MERCHANT_ID || '',
      webhookUrl: process.env.KPAY_WEBHOOK_URL
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'X-Merchant-ID': this.config.merchantId
      },
      timeout: 30000 // 30 seconds
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature(timestamp, config.data);
      
      config.headers['X-Timestamp'] = timestamp;
      config.headers['X-Signature'] = signature;
      
      return config;
    });
  }

  /**
   * Generate HMAC signature for request authentication
   */
  private generateSignature(timestamp: string, data: any): string {
    const payload = timestamp + JSON.stringify(data || {});
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  public verifyWebhookSignature(payload: KpayWebhookPayload): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(JSON.stringify(payload.data))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(payload.signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Initialize a payment
   */
  async initiatePayment(request: KpayPaymentRequest): Promise<KpayPaymentResponse> {
    try {
      const response = await this.client.post('/v1/payments/initiate', {
        amount: request.amount,
        currency: request.currency,
        customer: {
          email: request.customerEmail,
          name: request.customerName,
          phone: request.customerPhone
        },
        orderId: request.orderId,
        description: request.description,
        callbackUrl: request.callbackUrl || this.config.webhookUrl,
        metadata: request.metadata
      });

      return {
        success: true,
        data: {
          transactionId: response.data.transactionId,
          paymentUrl: response.data.paymentUrl,
          reference: response.data.reference,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status,
          expiresAt: new Date(response.data.expiresAt)
        }
      };
    } catch (error: any) {
      console.error('Kpay payment initiation error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'PAYMENT_INIT_ERROR',
          message: error.response?.data?.message || 'Failed to initiate payment'
        }
      };
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(transactionId: string): Promise<KpayTransactionStatus | null> {
    try {
      const response = await this.client.get(`/v1/payments/${transactionId}/status`);
      
      return {
        transactionId: response.data.transactionId,
        reference: response.data.reference,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
        paymentMethod: response.data.paymentMethod,
        paidAt: response.data.paidAt ? new Date(response.data.paidAt) : undefined,
        failedAt: response.data.failedAt ? new Date(response.data.failedAt) : undefined,
        failureReason: response.data.failureReason,
        customerInfo: response.data.customerInfo
      };
    } catch (error: any) {
      console.error('Kpay status check error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Process refund
   */
  async processRefund(request: KpayRefundRequest): Promise<KpayRefundResponse> {
    try {
      const response = await this.client.post('/v1/refunds', {
        transactionId: request.transactionId,
        amount: request.amount,
        reason: request.reason
      });

      return {
        success: true,
        data: {
          refundId: response.data.refundId,
          transactionId: response.data.transactionId,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status,
          processedAt: response.data.processedAt ? new Date(response.data.processedAt) : undefined
        }
      };
    } catch (error: any) {
      console.error('Kpay refund error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'REFUND_ERROR',
          message: error.response?.data?.message || 'Failed to process refund'
        }
      };
    }
  }

  /**
   * Get list of supported payment methods
   */
  async getPaymentMethods(): Promise<Array<{ code: string; name: string; enabled: boolean }>> {
    try {
      const response = await this.client.get('/v1/payment-methods');
      return response.data.methods;
    } catch (error: any) {
      console.error('Kpay payment methods error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Validate payment configuration
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/merchant/validate');
      return response.data.valid === true;
    } catch (error: any) {
      console.error('Kpay configuration validation error:', error.response?.data || error.message);
      return false;
    }
  }
}

// Export singleton instance
export const kpayService = new KpayService();