import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { OnboardingCompleteEmailData } from '../../types/email.types';

export const OnboardingCompleteEmail = ({
  organizationName,
  adminName,
}: OnboardingCompleteEmailData) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  return (
    <EmailLayout
      preview={`Your Peekaboo account is active - ${organizationName}`}
    >
      <Text style={styles.heading}>Account Activated!</Text>
      <Text style={styles.text}>Hi {adminName},</Text>
      <Text style={styles.text}>
        Congratulations! Your organization {organizationName}{' '}
        has been successfully set up on Peekaboo.
      </Text>
      <Text style={styles.text}>Here's what you can do now:</Text>
      <Text style={styles.listItem}>- Invite team members to your organization</Text>
      <Text style={styles.listItem}>- Create and manage delivery orders</Text>
      <Text style={styles.listItem}>- Track billing and invoices</Text>
      <Text style={styles.listItem}>- View delivery analytics</Text>
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
    color: '#2e7d32',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  listItem: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 4px',
    paddingLeft: '8px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
};

export default OnboardingCompleteEmail;
