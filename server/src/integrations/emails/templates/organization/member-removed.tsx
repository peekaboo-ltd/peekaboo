import { Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { MemberRemovedEmailData } from '../../types/email.types';

export const MemberRemovedEmail = ({
  organizationName,
  memberName,
}: MemberRemovedEmailData) => {
  return (
    <EmailLayout
      preview={`You've been removed from ${organizationName}`}
    >
      <Text style={emailStyles.heading}>Membership update</Text>
      <Text style={emailStyles.text}>Hi {memberName || 'there'},</Text>
      <Text style={emailStyles.text}>
        You have been removed from {organizationName} on
        Peekaboo. You will no longer be able to create orders or access
        resources on behalf of this organization.
      </Text>
      <Text style={emailStyles.text}>
        Your personal Peekaboo account remains active. If you believe this was
        done in error, please contact your organization administrator.
      </Text>
    </EmailLayout>
  );
};

export default MemberRemovedEmail;
