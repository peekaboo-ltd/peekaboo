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
  tierBreakdown,
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
      {tierBreakdown && tierBreakdown.length > 0 && (
        <Section style={styles.breakdownBox}>
          <Text style={styles.breakdownHeading}>Cost Breakdown</Text>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Tier</th>
                <th style={styles.tableHeader}>Deliveries</th>
                <th style={styles.tableHeader}>Unit Price</th>
                <th style={styles.tableHeader}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {tierBreakdown.map((tier, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{tier.tierLabel}</td>
                  <td style={styles.tableCellRight}>{tier.quantity}</td>
                  <td style={styles.tableCellRight}>
                    {currency} {tier.unitPrice?.toLocaleString()}
                  </td>
                  <td style={styles.tableCellRight}>
                    {currency} {tier.subtotal?.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={styles.tableCellBold}>Total</td>
                <td style={styles.tableCellRight}>{totalOrders}</td>
                <td style={styles.tableCell}></td>
                <td style={{ ...styles.tableCellRight, fontWeight: 'bold' }}>
                  {currency} {totalAmount?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      )}
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
  breakdownBox: {
    margin: '16px 0',
  },
  breakdownHeading: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  table: {
    width: '100%' as const,
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  tableHeader: {
    backgroundColor: '#f7f7f7',
    padding: '8px 12px',
    textAlign: 'left' as const,
    fontSize: '12px',
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    padding: '8px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#4a5568',
  },
  tableCellRight: {
    padding: '8px 12px',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'right' as const,
    color: '#4a5568',
  },
  tableCellBold: {
    padding: '8px 12px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
  },
};

export default InvoiceGeneratedEmail;
