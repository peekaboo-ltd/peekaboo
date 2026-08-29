import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { AccountStatusEmailData } from '../../types/email.types';

export const AccountStatusEmail = ({
  name,
  status,
  reason,
}: AccountStatusEmailData) => {
  const statusMessages = {
    suspended:
      'Your Peekaboo account has been suspended. You will not be able to access your account until it is reactivated.',
    reactivated:
      'Your Peekaboo account has been reactivated. You can now log in and use all services.',
    deleted:
      'Your Peekaboo account has been deactivated. Your data will be retained per our privacy policy.',
  };

  const badgeStatus = {
    suspended: 'SUSPENDED',
    reactivated: 'ACTIVATED',
    deleted: 'CANCELLED',
  };

  return (
    <EmailLayout preview={`Your Peekaboo account has been ${status}`}>
      <Text style={emailStyles.heading}>
        Account {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
      <Text style={emailStyles.text}>Hi {name || 'there'},</Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status={badgeStatus[status]} />
      </Section>
      <Text style={emailStyles.text}>{statusMessages[status]}</Text>
      {reason && (
        <Section style={emailStyles.framedCard}>
          <Text style={emailStyles.detailRow}>
            Reason: {reason}
          </Text>
        </Section>
      )}
      <Text style={emailStyles.text}>
        If you have questions about this change, please contact our support team
        at{' '}
        <a href="mailto:support@peekaboo.co.rw" style={emailStyles.link}>
          support@peekaboo.co.rw
        </a>
        .
      </Text>
    </EmailLayout>
  );
};

export default AccountStatusEmail;
