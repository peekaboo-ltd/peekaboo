import axios, { AxiosInstance } from 'axios';
import {
  KpayConfig,
  KpayPaymentRequest,
  KpayPaymentResponse,
  KpayTransactionStatus,
  KpayWebhookPayload,
  KpayStatusRequest,
  KpayRefundRequest,
  KpayRefundResponse,
  KpayPaymentStatus,
  KpayReturnCode,
  KpayPaymentMethod,
  KpayBankCode,
  KpayAction,
  KpayCurrency,
} from '../../types/kpay.types';
import { UUID } from '../../types';

export class KpayService {
  private readonly client: AxiosInstance;
  private readonly config: KpayConfig;

  constructor() {
    this.config = {
      username: process.env.KPAY_USERNAME || '',
      password: process.env.KPAY_PASSWORD || '',
      baseUrl: process.env.KPAY_BASE_URL || 'https://pay.esicia.com',
      retailerId: process.env.KPAY_RETAILER_ID || '',
      webhookUrl: process.env.KPAY_WEBHOOK_URL,
      // Keep backward compatibility
      apiKey: process.env.KPAY_API_KEY || '',
      secretKey: process.env.KPAY_SECRET_KEY || '',
      merchantId: process.env.KPAY_MERCHANT_ID || '',
    };

    // Create axios instance with Basic Authentication
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.config.username,
        password: this.config.password,
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Verify webhook payload is valid
   * Note: The actual Kpay API documentation doesn't specify signature verification
   * This method validates the payload structure
   */
  public verifyWebhookSignature(payload: KpayWebhookPayload): boolean {
    // Validate required fields are present
    if (!payload.tid || !payload.refid || !payload.statusid) {
      return false;
    }

    // Validate statusid is one of the expected values
    const validStatusIds = [
      KpayPaymentStatus.SUCCESSFUL,
      KpayPaymentStatus.FAILED,
      KpayPaymentStatus.PENDING,
    ];

    return validStatusIds.includes(payload.statusid as KpayPaymentStatus);
  }

  /**
   * Initialize a payment
   * @param request Payment request parameters (simplified interface for internal use)
   */
  async initiatePayment(request: {
    amount: number;
    currency: KpayCurrency;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    refId: UUID;
    description?: string;
    callbackUrl?: string;
    paymentMethod?: KpayPaymentMethod;
    bankId?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    success: boolean;
    data?: {
      transactionId: string;
      paymentUrl?: string;
      reference: string;
      amount: number;
      currency: string;
      status: string;
    };
    error?: {
      code: string;
      message: string;
    };
  }> {
    try {
      // Determine payment method and bank ID
      const pmethod = request.paymentMethod || 'momo';
      let bankid = request.bankId;

      // Auto-select bank ID based on payment method if not provided
      if (!bankid) {
        if (pmethod === 'momo') {
          bankid = KpayBankCode.MTN_MOMO; // Default to MTN
        } else if (pmethod === 'cc') {
          bankid = KpayBankCode.VISA_MASTERCARD;
        } else if (pmethod === 'spenn') {
          bankid = KpayBankCode.SPENN;
        } else if (pmethod === 'smartcash') {
          bankid = '63503'; // SmartCash (not in enum)
        } else {
          bankid = '040'; // Default to BK
        }
      }

      // Format phone number (remove + and spaces)
      const msisdn =
        request.customerPhone?.replace(/[\s+]/g, '') || '250000000000';

      // Prepare Kpay API request
      const kpayRequest: KpayPaymentRequest = {
        action: KpayAction.PAY,
        msisdn,
        email: request.customerEmail,
        details: request.description || 'Payment',
        refid: request.refId,
        amount: request.amount,
        currency: request.currency || KpayCurrency.RWF,
        cname: request.customerName,
        cnumber: msisdn, // Use phone as customer number
        pmethod: pmethod as KpayPaymentMethod,
        retailerid: this.config.retailerId,
        returl: request.callbackUrl || this.config.webhookUrl || '',
        redirecturl:
          request.metadata?.redirectUrl ||
          process.env.FRONTEND_URL ||
          `https://peekaboo.co.rw/payments/kpay?refId=${request.refId}`,
        bankid,
        logourl: request.metadata?.logoUrl,
      };

      // Make request to Kpay API
      const response = await this.client.post<KpayPaymentResponse>(
        '/',
        kpayRequest
      );

      // Check if request was successful
      if (
        response.data.retcode === KpayReturnCode.SUCCESS ||
        response.data.success === 1
      ) {
        return {
          success: true,
          data: {
            transactionId: response.data.tid,
            paymentUrl: response.data.url,
            reference: response.data.refid,
            amount: request.amount,
            currency: request.currency || 'RWF',
            status: response.data.reply || KpayPaymentStatus.SUCCESSFUL,
          },
        };
      } else {
        return {
          success: false,
          error: {
            code: response.data.retcode?.toString() || 'UNKNOWN_ERROR',
            message: response.data.reply || 'Payment initiation failed',
          },
        };
      }
    } catch (error: any) {
      console.error('Kpay payment initiation error:', error);

      // Handle network errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: `Unable to connect to Kpay service at ${this.config.baseUrl}. Please check your network connection and verify the base URL is correct.`,
          },
        };
      }

      // Handle timeout errors
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: 'Payment request timed out. Please try again.',
          },
        };
      }

      // Handle Kpay API errors
      if (error.response?.data) {
        const retcode = error.response.data.retcode;
        const reply = error.response.data.reply;

        return {
          success: false,
          error: {
            code: this.getErrorCode(retcode),
            message: this.getErrorMessage(retcode, reply),
          },
        };
      }

      // Generic error
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Payment initiation failed. Please try again.',
        },
      };
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(
    transactionId: string
  ): Promise<KpayTransactionStatus | null> {
    try {
      const statusRequest: KpayStatusRequest = {
        action: 'checkstatus',
        tid: transactionId,
      };

      const response = await this.client.post<KpayTransactionStatus>(
        '/',
        statusRequest
      );

      return response.data;
    } catch (error: any) {
      console.error(
        'Kpay status check error:',
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * Check payment status by reference ID
   */
  async getPaymentStatusByRefId(
    refId: string
  ): Promise<KpayTransactionStatus | null> {
    try {
      const statusRequest: KpayStatusRequest = {
        action: 'checkstatus',
        refid: refId,
      };

      const response = await this.client.post<KpayTransactionStatus>(
        '/',
        statusRequest
      );

      return response.data;
    } catch (error: any) {
      console.error(
        'Kpay status check error:',
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * Process refund
   * Note: Refund functionality is not documented in the provided Kpay API docs
   * This is a placeholder implementation
   */
  async processRefund(request: KpayRefundRequest): Promise<KpayRefundResponse> {
    console.warn(
      'Kpay refund API is not documented. This is a placeholder implementation.'
    );

    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Refund functionality is not available in Kpay API',
      },
    };
  }

  /**
   * Get list of supported payment methods
   * Returns static list based on documentation
   */
  async getPaymentMethods(): Promise<
    Array<{ code: string; name: string; enabled: boolean }>
  > {
    return [
      {
        code: KpayPaymentMethod.MOBILE_MONEY,
        name: 'Mobile Money (MTN/Airtel)',
        enabled: true,
      },
      {
        code: KpayPaymentMethod.CREDIT_CARD,
        name: 'Visa/MasterCard',
        enabled: true,
      },
      { code: KpayPaymentMethod.SPENN, name: 'Spenn', enabled: true },
      { code: KpayPaymentMethod.SMARTCASH, name: 'SmartCash', enabled: true },
      { code: KpayPaymentMethod.BANK, name: 'Bank Payment', enabled: true },
    ];
  }

  /**
   * Validate payment configuration
   */
  async validateConfiguration(): Promise<boolean> {
    // Check if required configuration is present
    if (
      !this.config.username ||
      !this.config.password ||
      !this.config.retailerId
    ) {
      console.error('Kpay configuration is incomplete');
      return false;
    }

    try {
      // Try to make a simple request to validate credentials
      // Using a test status check
      await this.client.post('/', {
        action: 'checkstatus',
        refid: 'test-validation-' + Date.now(),
      });

      return true;
    } catch (error: any) {
      // If error is authentication related, config is invalid
      if (
        error.response?.status === 401 ||
        error.response?.data?.retcode === KpayReturnCode.INVALID_CREDENTIALS
      ) {
        console.error('Kpay authentication failed');
        return false;
      }

      // Other errors might be OK (e.g., transaction not found)
      // This just means we can reach the API
      return true;
    }
  }

  /**
   * Map Kpay statusid to internal payment status
   */
  public mapKpayStatusToInternal(statusid: string): string {
    switch (statusid) {
      case KpayPaymentStatus.SUCCESSFUL:
        return 'SUCCESSFUL';
      case KpayPaymentStatus.FAILED:
        return 'FAILED';
      case KpayPaymentStatus.PENDING:
        return 'PENDING';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Get bank codes
   */
  public getBankCodes() {
    return {
      MTN_MOMO: KpayBankCode.MTN_MOMO,
      AIRTEL_MONEY: KpayBankCode.AIRTEL_MONEY,
      VISA_MASTERCARD: KpayBankCode.VISA_MASTERCARD,
      SPENN: KpayBankCode.SPENN,
      MOBICASH: KpayBankCode.MOBICASH,
      BK: KpayBankCode.BK,
      EQUITY: KpayBankCode.EQUITY,
      BPR: KpayBankCode.BPR,
      COGEBANQUE: KpayBankCode.COGEBANQUE,
    };
  }

  /**
   * Get error code string from retcode
   */
  private getErrorCode(retcode?: number): string {
    if (!retcode) return 'UNKNOWN_ERROR';

    switch (retcode) {
      case KpayReturnCode.MISSING_AUTH:
        return 'MISSING_AUTH';
      case KpayReturnCode.NON_HTTPS:
        return 'NON_HTTPS';
      case KpayReturnCode.INVALID_CREDENTIALS:
        return 'INVALID_CREDENTIALS';
      case KpayReturnCode.INVALID_USER:
        return 'INVALID_USER';
      case KpayReturnCode.IP_NOT_WHITELISTED:
        return 'IP_NOT_WHITELISTED';
      case KpayReturnCode.EMPTY_PARAMETER:
        return 'EMPTY_PARAMETER';
      case KpayReturnCode.UNKNOWN_RETAILER:
        return 'UNKNOWN_RETAILER';
      case KpayReturnCode.RETAILER_NOT_ENABLED:
        return 'RETAILER_NOT_ENABLED';
      case KpayReturnCode.ERROR_PROCESSING:
        return 'ERROR_PROCESSING';
      case KpayReturnCode.FAILED_MOMO:
        return 'FAILED_MOMO';
      case KpayReturnCode.DUPLICATE_REFID:
        return 'DUPLICATE_REFID';
      case KpayReturnCode.UNKNOWN_PAYMENT_METHOD:
        return 'UNKNOWN_PAYMENT_METHOD';
      case KpayReturnCode.UNKNOWN_BANK:
        return 'UNKNOWN_BANK';
      case KpayReturnCode.NOT_FOUND:
        return 'NOT_FOUND';
      default:
        return `ERROR_${retcode}`;
    }
  }

  /**
   * Get user-friendly error message from retcode
   */
  private getErrorMessage(retcode?: number, reply?: string): string {
    if (!retcode) return reply || 'Payment processing failed';

    switch (retcode) {
      case KpayReturnCode.MISSING_AUTH:
        return 'Authentication header is missing. Please contact support.';
      case KpayReturnCode.NON_HTTPS:
        return 'Non-HTTPS request detected. Please contact support.';
      case KpayReturnCode.INVALID_CREDENTIALS:
        return 'Invalid Kpay credentials. Please contact support.';
      case KpayReturnCode.INVALID_USER:
        return 'Invalid remote user. Please contact support.';
      case KpayReturnCode.IP_NOT_WHITELISTED:
        return 'Server IP address is not whitelisted. Please contact support.';
      case KpayReturnCode.EMPTY_PARAMETER:
        return 'Required payment information is missing. Please try again.';
      case KpayReturnCode.UNKNOWN_RETAILER:
        return 'Unknown retailer configuration. Please contact support.';
      case KpayReturnCode.RETAILER_NOT_ENABLED:
        return 'Payment service is not enabled. Please contact support.';
      case KpayReturnCode.ERROR_PROCESSING:
        return 'Payment processing error. Please try again.';
      case KpayReturnCode.FAILED_MOMO:
        return 'Mobile money transaction failed. Please check your balance and try again.';
      case KpayReturnCode.DUPLICATE_REFID:
        return 'This payment reference has already been used. Please refresh and try again.';
      case KpayReturnCode.UNKNOWN_PAYMENT_METHOD:
        return 'Selected payment method is not supported. Please choose a different method.';
      case KpayReturnCode.UNKNOWN_BANK:
        return 'Selected payment provider is not available. Please choose a different provider.';
      case KpayReturnCode.NOT_FOUND:
        return 'Transaction not found.';
      default:
        return reply || `Payment processing failed with error code ${retcode}`;
    }
  }
}
