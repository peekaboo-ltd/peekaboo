import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { PaymentOverdueEmailData } from '../../types/email.types';

export const PaymentOverdueEmail = ({
  organizationName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  daysOverdue,
}: PaymentOverdueEmailData) => {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <EmailLayout preview={`Payment overdue for invoice ${invoiceNumber}`}>
      <Text style={styles.heading}>Payment Overdue</Text>
      <Text style={styles.text}>Hi,</Text>
      <Text style={styles.text}>
        The payment for <strong>{organizationName}</strong> is now{' '}
        <strong>{daysOverdue} days overdue</strong>. Please process the payment
        as soon as possible to avoid service interruption.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Invoice Number:</strong> {invoiceNumber}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Amount Due:</strong> {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Due Date:</strong> {formatDate(dueDate)}
        </Text>
        <Text style={styles.overdueRow}>
          <strong>Days Overdue:</strong> {daysOverdue}
        </Text>
      </Section>
      <Text style={styles.text}>
        If you've already processed this payment, please disregard this notice.
        For questions about billing, contact us at{' '}
        <a href="mailto:support@peekaboo.co.rw" style={styles.link}>
          support@peekaboo.co.rw
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
  overdueRow: {
    fontSize: '14px',
    color: '#c62828',
    fontWeight: 'bold' as const,
    margin: '4px 0',
  },
  link: {
    color: '#1a1a2e',
    textDecoration: 'underline' as const,
  },
};

export default PaymentOverdueEmail;
