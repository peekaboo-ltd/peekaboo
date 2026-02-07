import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
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
      <Text style={styles.heading}>Payment Successful</Text>
      <Text style={styles.text}>Hi {customerName || 'there'},</Text>
      <Text style={styles.text}>
        Your payment has been successfully processed. Here are the details:
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Order Reference:</strong> {orderReference}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Amount Paid:</strong> {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Transaction ID:</strong> {transactionId}
        </Text>
      </Section>
      <Text style={styles.successText}>
        A rider will be assigned to your order shortly. You'll receive
        notifications as your delivery progresses.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#2e7d32',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  detailsBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
  successText: {
    fontSize: '14px',
    color: '#2e7d32',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
};

export default PaymentSuccessfulEmail;
