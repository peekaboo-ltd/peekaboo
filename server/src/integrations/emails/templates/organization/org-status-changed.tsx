import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { OrganizationStatusEmailData } from '../../types/email.types';

export const OrgStatusChangedEmail = ({
  organizationName,
  adminName,
  status,
  reason,
}: OrganizationStatusEmailData) => {
  const isActive = status === 'ACTIVE';

  return (
    <EmailLayout
      preview={`${organizationName} has been ${isActive ? 'activated' : 'suspended'}`}
    >
      <Text style={styles.heading}>
        Organization {isActive ? 'Activated' : 'Suspended'}
      </Text>
      <Text style={styles.text}>Hi {adminName},</Text>
      <Text style={styles.text}>
        Your organization <strong>{organizationName}</strong> has been{' '}
        {isActive ? 'activated' : 'suspended'} on Peekaboo.
      </Text>
      <Section style={styles.statusContainer}>
        <StatusBadge status={isActive ? 'ACTIVATED' : 'SUSPENDED'} />
      </Section>
      {reason && (
        <Section style={styles.detailsBox}>
          <Text style={styles.detailRow}>
            <strong>Reason:</strong> {reason}
          </Text>
        </Section>
      )}
      {isActive ? (
        <Text style={styles.text}>
          You can now resume using all Peekaboo services for your organization.
        </Text>
      ) : (
        <Text style={styles.text}>
          While suspended, your organization members will not be able to create
          new orders. Please contact our support team for more information.
        </Text>
      )}
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
};

export default OrgStatusChangedEmail;
