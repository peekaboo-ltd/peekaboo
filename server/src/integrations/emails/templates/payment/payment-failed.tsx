import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { PaymentFailedEmailData } from '../../types/email.types';

export const PaymentFailedEmail = ({
  customerName,
  orderReference,
  amount,
  currency,
}: PaymentFailedEmailData) => {
  return (
    <EmailLayout preview={`Payment failed for order ${orderReference}`}>
      <Text style={styles.heading}>Payment Failed</Text>
      <Text style={styles.text}>Hi {customerName || 'there'},</Text>
      <Text style={styles.text}>
        Unfortunately, your payment could not be processed. Here are the
        details:
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Order Reference:</strong> {orderReference}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Amount:</strong> {currency} {amount?.toLocaleString()}
        </Text>
      </Section>
      <Text style={styles.text}>
        Please try again or use a different payment method. If the issue
        persists, contact our support team at{' '}
        <a href="mailto:support@peekaboo.rw" style={styles.link}>
          support@peekaboo.rw
        </a>
        .
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#c62828',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  detailsBox: {
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
  link: {
    color: '#1a1a2e',
    textDecoration: 'underline' as const,
  },
};

export default PaymentFailedEmail;
