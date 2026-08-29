import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Monthly billing summary</Text>
      <Text style={emailStyles.text}>Hi,</Text>
      <Text style={emailStyles.text}>
        Here's the billing summary for {organizationName} for{' '}
        {month} {year}.
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Month: {month} {year}
        </Text>
        <Text style={emailStyles.detailRow}>
          Total orders: {totalOrders}
        </Text>
        <Text style={emailStyles.amountRow}>
          Total amount: {currency}{' '}
          {totalAmount?.toLocaleString()}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        For detailed billing information, please visit your dashboard.
      </Text>
    </EmailLayout>
  );
};

export default MonthlyBillingSummaryEmail;
