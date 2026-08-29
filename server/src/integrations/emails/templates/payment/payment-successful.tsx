import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { PaymentSuccessfulEmailData } from '../../types/email.types';

export const PaymentSuccessfulEmail = ({
  customerName,
  orderReference,
  amount,
  currency,
  transactionId,
}: PaymentSuccessfulEmailData) => {
  return (
    <EmailLayout preview={`Payment confirmed for order ${orderReference}`}>
      <Text style={emailStyles.heading}>Payment successful</Text>
      <Text style={emailStyles.text}>Hi {customerName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your payment has been successfully processed. Here are the details:
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="SUCCESSFUL" />
      </Section>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Order reference: {orderReference}
        </Text>
        <Text style={emailStyles.detailRow}>
          Amount paid: {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={emailStyles.detailRow}>
          Transaction ID: {transactionId}
        </Text>
      </Section>
      <Text style={emailStyles.textInk}>
        A rider will be assigned to your order shortly. You'll receive
        notifications as your delivery progresses.
      </Text>
    </EmailLayout>
  );
};

export default PaymentSuccessfulEmail;
