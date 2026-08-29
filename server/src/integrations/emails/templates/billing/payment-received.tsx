import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Payment received</Text>
      <Text style={emailStyles.text}>Hi,</Text>
      <Text style={emailStyles.text}>
        We've received your payment for {organizationName}.
        Thank you!
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="PAID" />
      </Section>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Invoice number: {invoiceNumber}
        </Text>
        <Text style={emailStyles.amountRow}>
          Amount paid: {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={emailStyles.detailRow}>
          Payment date: {formatDate(paymentDate)}
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default BillingPaymentReceivedEmail;
