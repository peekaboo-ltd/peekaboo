import type { PaymentChannel } from '@/types/payment.types';

export type PayerType = 'sender' | 'recipient' | 'other';

export interface PaymentFormValues {
  channelName: PaymentChannel;
  payerType: PayerType;
  customPhone: string;
  fallbackPhone: string;
}
