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
        The payment for {organizationName} is now{' '}
        {daysOverdue} days overdue. Please process the payment
        as soon as possible to avoid service interruption.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Invoice Number: {invoiceNumber}
        </Text>
        <Text style={styles.detailRow}>
          Amount Due: {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={styles.detailRow}>
          Due Date: {formatDate(dueDate)}
        </Text>
        <Text style={styles.overdueRow}>
          Days Overdue: {daysOverdue}
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
    fontWeight: '500' as const,
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
    fontWeight: '500' as const,
    margin: '4px 0',
  },
  link: {
    color: '#1a1a2e',
    textDecoration: 'underline' as const,
  },
};

export default PaymentOverdueEmail;
