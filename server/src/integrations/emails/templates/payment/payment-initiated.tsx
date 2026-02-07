import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { PaymentInitiatedEmailData } from '../../types/email.types';

export const PaymentInitiatedEmail = ({
  customerName,
  orderReference,
  amount,
  currency,
}: PaymentInitiatedEmailData) => {
  return (
    <EmailLayout preview={`Payment initiated for order ${orderReference}`}>
      <Text style={styles.heading}>Payment Initiated</Text>
      <Text style={styles.text}>Hi {customerName || 'there'},</Text>
      <Text style={styles.text}>
        Your payment has been initiated for the following order:
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
        Please complete the payment to confirm your delivery. You'll receive a
        confirmation once the payment is processed.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  detailsBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
};

export default PaymentInitiatedEmail;
