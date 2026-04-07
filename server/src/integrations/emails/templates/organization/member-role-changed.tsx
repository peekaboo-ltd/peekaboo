import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { MemberRoleChangedEmailData } from '../../types/email.types';

export const MemberRoleChangedEmail = ({
  organizationName,
  memberName,
  oldRole,
  newRole,
  changedBy,
}: MemberRoleChangedEmailData) => {
  return (
    <EmailLayout preview={`Your role in ${organizationName} has been updated`}>
      <Text style={styles.heading}>Role Updated</Text>
      <Text style={styles.text}>Hi {memberName || 'there'},</Text>
      <Text style={styles.text}>
        Your role in {organizationName} has been changed:
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Previous Role: {oldRole}
        </Text>
        <Text style={styles.detailRow}>
          New Role: {newRole}
        </Text>
        <Text style={styles.detailRow}>
          Changed By: {changedBy}
        </Text>
      </Section>
      <Text style={styles.text}>
        If you have questions about this change, please contact your
        organization administrator.
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
};

export default MemberRoleChangedEmail;
