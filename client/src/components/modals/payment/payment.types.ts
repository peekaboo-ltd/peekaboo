import type { PaymentChannel } from '@/types/payment.types';

export type PayerType = 'sender' | 'recipient' | 'other';

export interface PaymentFormValues {
  channelName: PaymentChannel;
  payerType: PayerType;
  customPhone: string;
  fallbackPhone: string;
  /** Card only — sent to the gateway as the payer name. */
  cardholderName: string;
  /** Card only — where the gateway sends the receipt. */
  payerEmail: string;
}
