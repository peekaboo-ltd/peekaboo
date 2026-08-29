import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { PaymentFailedEmailData } from '../../types/email.types';

export const PaymentFailedEmail = ({
  customerName,
  orderReference,
  amount,
  currency,
}: PaymentFailedEmailData) => {
  return (
    <EmailLayout preview={`Payment failed for order ${orderReference}`}>
      <Text style={emailStyles.heading}>Payment failed</Text>
      <Text style={emailStyles.text}>Hi {customerName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Unfortunately, your payment could not be processed. Here are the
        details:
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="FAILED" />
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
        Please try again or use a different payment method. If the issue
        persists, contact our support team at{' '}
        <a href="mailto:support@peekaboo.co.rw" style={emailStyles.link}>
          support@peekaboo.co.rw
        </a>
        .
      </Text>
    </EmailLayout>
  );
};

export default PaymentFailedEmail;
