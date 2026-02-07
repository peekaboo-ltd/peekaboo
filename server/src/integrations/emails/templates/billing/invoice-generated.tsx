import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { InvoiceGeneratedEmailData } from '../../types/email.types';

export const InvoiceGeneratedEmail = ({
  organizationName,
  invoiceNumber,
  periodStart,
  periodEnd,
  totalAmount,
  currency,
  totalOrders,
}: InvoiceGeneratedEmailData) => {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} generated for ${organizationName}`}>
      <Text style={styles.heading}>Invoice Generated</Text>
      <Text style={styles.text}>Hi,</Text>
      <Text style={styles.text}>
        A new invoice has been generated for <strong>{organizationName}</strong>.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Invoice Number:</strong> {invoiceNumber}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Billing Period:</strong> {formatDate(periodStart)} -{' '}
          {formatDate(periodEnd)}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Total Orders:</strong> {totalOrders}
        </Text>
        <Text style={styles.amountRow}>
          <strong>Total Amount:</strong> {currency}{' '}
          {totalAmount?.toLocaleString()}
        </Text>
      </Section>
      <Text style={styles.text}>
        Please review the invoice and process the payment at your earliest
        convenience.
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
  amountRow: {
    fontSize: '16px',
    color: '#1a1a2e',
    fontWeight: 'bold' as const,
    margin: '8px 0 0',
  },
};

export default InvoiceGeneratedEmail;
