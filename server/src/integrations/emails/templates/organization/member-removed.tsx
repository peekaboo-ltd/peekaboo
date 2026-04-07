import { Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { MemberRemovedEmailData } from '../../types/email.types';

export const MemberRemovedEmail = ({
  organizationName,
  memberName,
}: MemberRemovedEmailData) => {
  return (
    <EmailLayout
      preview={`You've been removed from ${organizationName}`}
    >
      <Text style={styles.heading}>Membership Update</Text>
      <Text style={styles.text}>Hi {memberName || 'there'},</Text>
      <Text style={styles.text}>
        You have been removed from {organizationName} on
        Peekaboo. You will no longer be able to create orders or access
        resources on behalf of this organization.
      </Text>
      <Text style={styles.text}>
        Your personal Peekaboo account remains active. If you believe this was
        done in error, please contact your organization administrator.
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
};

export default MemberRemovedEmail;
