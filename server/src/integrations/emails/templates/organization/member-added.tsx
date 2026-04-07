import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
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
      <Text style={styles.heading}>Welcome to {organizationName}!</Text>
      <Text style={styles.text}>Hi {memberName || 'there'},</Text>
      <Text style={styles.text}>
        You've been added as a {role} to {organizationName} on Peekaboo.
      </Text>
      <Text style={styles.text}>
        You can now create and manage deliveries on behalf of your organization.
      </Text>
      <Section style={styles.buttonContainer}>
        <EmailButton href={`${baseUrl}/dashboard`}>Go to Dashboard</EmailButton>
      </Section>
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
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
};

export default MemberAddedEmail;
