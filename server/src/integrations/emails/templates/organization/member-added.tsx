import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
import { MemberAddedEmailData } from '../../types/email.types';

export const MemberAddedEmail = ({
  organizationName,
  memberName,
  role,
}: MemberAddedEmailData) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  return (
    <EmailLayout
      preview={`You've been added to ${organizationName} on Peekaboo`}
    >
      <Text style={emailStyles.heading}>Welcome to {organizationName}!</Text>
      <Text style={emailStyles.text}>Hi {memberName || 'there'},</Text>
      <Text style={emailStyles.text}>
        You've been added as a {role} to {organizationName} on Peekaboo.
      </Text>
      <Text style={emailStyles.text}>
        You can now create and manage deliveries on behalf of your organization.
      </Text>
      <Section style={emailStyles.buttonContainer}>
        <EmailButton href={`${baseUrl}/dashboard`}>Go to dashboard</EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default MemberAddedEmail;
