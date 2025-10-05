// Kpay Payment Gateway Types and Interfaces
// Based on Kpay API Documentation (pay.esicia.rw)

export interface KpayConfig {
  username: string;
  password: string;
  baseUrl: string;
  retailerId: string;
  webhookUrl?: string;
  apiKey: string;
  secretKey: string;
  merchantId: string;
}

export enum KpayCurrency {
  RWF = 'RWF',
  USD = 'USD',
}

export enum KpayAction {
  PAY = 'pay',
  CHECKSTATUS = 'checkstatus',
}

// Payment Request (POST to pay.esicia.rw)
export interface KpayPaymentRequest {
  action: KpayAction;
  msisdn: string; // Phone number with country code (no + sign)
  email: string;
  details: string; // Payment description
  refid: string; // Unique reference from your system
  amount: number; // Amount in smallest currency unit
  currency?: KpayCurrency; // Defaults to RWF
  cname: string; // Customer name
  cnumber: string; // Customer number at payment processor level
  pmethod: KpayPaymentMethod // Payment method
  retailerid: string; // Unique retailer ID
  returl: string; // Webhook URL for postback
  redirecturl: string; // Redirect URL after payment
  bankid: string; // Financial institution ID (see bank codes)
  logourl?: string; // Optional logo URL for card checkout
}

// Initial Payment Response
export interface KpayPaymentResponse {
  reply: string; // 'PENDING' or error message
  url?: string; // Checkout URL for card payments
  success: 0 | 1;
  authkey?: string;
  tid: string; // Kpay transaction ID
  refid: string; // Your reference ID
  retcode: number; // 0 = success, other = error code
}

// Webhook/Postback Payload (from Kpay to your returl)
export interface KpayWebhookPayload {
  tid: string; // Kpay internal payment reference
  refid: string; // Your payment reference
  momtransactionid: string; // Transaction ID from financial institution
  payaccount?: string; // Bank account/mobile number used to pay
  statusid: string; // '01' = successful, '02' = failed, other = error codes
  statusdesc: string; // Status description
}

// Check Status Request
export interface KpayStatusRequest {
  action: 'checkstatus';
  tid?: string; // Kpay transaction ID
  refid?: string; // Your reference ID (one of tid/refid required)
}

// Check Status Response (same as webhook payload)
export interface KpayTransactionStatus {
  tid: string;
  refid: string;
  momtransactionid: string;
  payaccount?: string;
  statusid: string; // '01' = successful, '02' = failed
  statusdesc: string;
}

// Payment Status Codes
export enum KpayPaymentStatus {
  PENDING = '03', // Pending transaction
  SUCCESSFUL = '01', // Successful payment
  FAILED = '02', // Payment failed
}

// Return/Error Codes
export enum KpayReturnCode {
  SUCCESS = 0, // No error, transaction being processed
  SUCCESSFUL_PAYMENT = 1, // Payment completed (statusid '01')
  FAILED_PAYMENT = 2, // Payment failed (statusid '02')
  PENDING = 3, // Pending transaction (statusid '03')
  MISSING_AUTH = 401, // Missing authentication header
  NON_HTTPS = 500, // Non HTTPS request
  INVALID_CREDENTIALS = 600, // Invalid username/password
  INVALID_USER = 601, // Invalid remote user
  IP_NOT_WHITELISTED = 602, // IP not whitelisted
  EMPTY_PARAMETER = 603, // Missing required parameters
  UNKNOWN_RETAILER = 604, // Unknown retailer
  RETAILER_NOT_ENABLED = 605, // Retailer not enabled
  ERROR_PROCESSING = 606, // Error processing
  FAILED_MOMO = 607, // Failed mobile money transaction
  DUPLICATE_REFID = 608, // Used ref id
  UNKNOWN_PAYMENT_METHOD = 609, // Unknown payment method
  UNKNOWN_BANK = 610, // Unknown/not enabled financial institution
  NOT_FOUND = 611, // Transaction not found
}

// Payment Methods
export enum KpayPaymentMethod {
  MOBILE_MONEY = 'momo',
  CREDIT_CARD = 'cc',
  BANK = 'bank',
  SPENN = 'spenn',
  SMARTCASH = 'smartcash',
}

// Bank/Financial Institution Codes
export enum KpayBankCode {
  MTN_MOMO = '63510',
  AIRTEL_MONEY = '63514',
  VISA_MASTERCARD = '000',
  MOBICASH = '63501',
  SPENN = '63502',
  BK = '040',
  EQUITY = '192',
  BPR = '400',
  COGEBANQUE = '130',
  // Add more bank codes as needed
}

// Refund functionality (if supported - not in provided docs)
export interface KpayRefundRequest {
  transactionId: string;
  amount?: number;
  reason: string;
}

export interface KpayRefundResponse {
  success: boolean;
  data?: {
    refundId: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    processedAt?: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}