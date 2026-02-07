import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
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
      <Text style={styles.heading}>Account {status.charAt(0).toUpperCase() + status.slice(1)}</Text>
      <Text style={styles.text}>Hi {name || 'there'},</Text>
      <Section style={styles.statusContainer}>
        <StatusBadge status={badgeStatus[status]} />
      </Section>
      <Text style={styles.text}>{statusMessages[status]}</Text>
      {reason && (
        <Section style={styles.detailsBox}>
          <Text style={styles.detailRow}>
            <strong>Reason:</strong> {reason}
          </Text>
        </Section>
      )}
      <Text style={styles.text}>
        If you have questions about this change, please contact our support team
        at{' '}
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
    color: '#1a1a2e',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  statusContainer: {
    textAlign: 'center' as const,
    margin: '16px 0',
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
  link: {
    color: '#1a1a2e',
    textDecoration: 'underline' as const,
  },
};

export default AccountStatusEmail;
