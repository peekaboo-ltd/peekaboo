import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Role updated</Text>
      <Text style={emailStyles.text}>Hi {memberName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your role in {organizationName} has been changed:
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Previous role: {oldRole}
        </Text>
        <Text style={emailStyles.detailRow}>
          New role: {newRole}
        </Text>
        <Text style={emailStyles.detailRow}>
          Changed by: {changedBy}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        If you have questions about this change, please contact your
        organization administrator.
      </Text>
    </EmailLayout>
  );
};

export default MemberRoleChangedEmail;
