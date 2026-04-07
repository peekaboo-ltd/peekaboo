import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { PaymentReceivedEmailData } from '../../types/email.types';

export const BillingPaymentReceivedEmail = ({
  organizationName,
  invoiceNumber,
  amount,
  currency,
  paymentDate,
}: PaymentReceivedEmailData) => {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <EmailLayout preview={`Payment received for invoice ${invoiceNumber}`}>
      <Text style={styles.heading}>Payment Received</Text>
      <Text style={styles.text}>Hi,</Text>
      <Text style={styles.text}>
        We've received your payment for {organizationName}.
        Thank you!
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Invoice Number: {invoiceNumber}
        </Text>
        <Text style={styles.detailRow}>
          Amount Paid: {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={styles.detailRow}>
          Payment Date: {formatDate(paymentDate)}
        </Text>
      </Section>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: '500' as const,
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
    padding: '16px',
    margin: '16px 0',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
};

export default BillingPaymentReceivedEmail;
