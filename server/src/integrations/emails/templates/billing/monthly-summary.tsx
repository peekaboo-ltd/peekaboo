import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { MonthlyBillingSummaryEmailData } from '../../types/email.types';

export const MonthlyBillingSummaryEmail = ({
  organizationName,
  month,
  year,
  totalOrders,
  totalAmount,
  currency,
}: MonthlyBillingSummaryEmailData) => {
  return (
    <EmailLayout
      preview={`${month} ${year} billing summary for ${organizationName}`}
    >
      <Text style={styles.heading}>Monthly Billing Summary</Text>
      <Text style={styles.text}>Hi,</Text>
      <Text style={styles.text}>
        Here's the billing summary for {organizationName} for{' '}
        {month} {year}.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Month: {month} {year}
        </Text>
        <Text style={styles.detailRow}>
          Total Orders: {totalOrders}
        </Text>
        <Text style={styles.amountRow}>
          Total Amount: {currency}{' '}
          {totalAmount?.toLocaleString()}
        </Text>
      </Section>
      <Text style={styles.text}>
        For detailed billing information, please visit your dashboard.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: '500' as const,
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
    fontWeight: '500' as const,
    margin: '8px 0 0',
  },
};

export default MonthlyBillingSummaryEmail;
