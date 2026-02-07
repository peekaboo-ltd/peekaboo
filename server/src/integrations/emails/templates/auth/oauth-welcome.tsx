import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { OAuthWelcomeEmailData } from '../../types/email.types';

export const OAuthWelcomeEmail = ({
  name,
  provider,
  dashboardUrl,
}: OAuthWelcomeEmailData) => {
  return (
    <EmailLayout
      preview={`Welcome to Peekaboo! Your ${provider} account is linked.`}
    >
      <Text style={styles.heading}>Welcome to Peekaboo!</Text>
      <Text style={styles.text}>Hi {name},</Text>
      <Text style={styles.text}>
        Your Peekaboo account has been created using your {provider} account.
        You can now sign in at any time using {provider}.
      </Text>
      <Text style={styles.text}>
        With Peekaboo, you can easily send and receive deliveries across Kigali.
      </Text>
      <Section style={styles.buttonContainer}>
        <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
      </Section>
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
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
};

export default OAuthWelcomeEmail;
