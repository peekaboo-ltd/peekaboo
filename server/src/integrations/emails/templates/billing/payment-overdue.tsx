import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Payment overdue</Text>
      <Text style={emailStyles.text}>Hi,</Text>
      <Text style={emailStyles.text}>
        The payment for {organizationName} is now{' '}
        {daysOverdue} days overdue. Please process the payment
        as soon as possible to avoid service interruption.
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="OVERDUE" />
      </Section>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Invoice number: {invoiceNumber}
        </Text>
        <Text style={emailStyles.amountRow}>
          Amount due: {currency} {amount?.toLocaleString()}
        </Text>
        <Text style={emailStyles.detailRow}>
          Due date: {formatDate(dueDate)}
        </Text>
        <Text style={emailStyles.textInk}>
          Days overdue: {daysOverdue}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        If you've already processed this payment, please disregard this notice.
        For questions about billing, contact us at{' '}
        <a href="mailto:support@peekaboo.co.rw" style={emailStyles.link}>
          support@peekaboo.co.rw
        </a>
        .
      </Text>
    </EmailLayout>
  );
};

export default PaymentOverdueEmail;
