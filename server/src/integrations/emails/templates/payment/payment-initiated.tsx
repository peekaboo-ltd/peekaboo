import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { PaymentInitiatedEmailData } from '../../types/email.types';

export const PaymentInitiatedEmail = ({
  customerName,
  orderReference,
  amount,
  currency,
}: PaymentInitiatedEmailData) => {
  return (
    <EmailLayout preview={`Payment initiated for order ${orderReference}`}>
      <Text style={emailStyles.heading}>Payment initiated</Text>
      <Text style={emailStyles.text}>Hi {customerName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your payment has been initiated for the following order:
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="PENDING" />
      </Section>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Order reference: {orderReference}
        </Text>
        <Text style={emailStyles.amountRow}>
          Amount: {currency} {amount?.toLocaleString()}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        Please complete the payment to confirm your delivery. You'll receive a
        confirmation once the payment is processed.
      </Text>
    </EmailLayout>
  );
};

export default PaymentInitiatedEmail;
