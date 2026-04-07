import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { WelcomeEmailData } from '../../types/email.types';

export const WelcomeEmail = ({ name, loginUrl }: WelcomeEmailData) => {
  return (
    <EmailLayout preview={`Welcome to Peekaboo, ${name}!`}>
      <Text style={styles.heading}>Welcome to Peekaboo!</Text>
      <Text style={styles.text}>Hi {name},</Text>
      <Text style={styles.text}>
        Thank you for creating your Peekaboo account. We're excited to have you
        on board! With Peekaboo, you can easily send and receive deliveries
        across Kigali.
      </Text>
      <Text style={styles.text}>
        Here's what you can do with your account:
      </Text>
      <Text style={styles.listItem}>- Send packages to anyone in Kigali</Text>
      <Text style={styles.listItem}>- Track your deliveries in real-time</Text>
      <Text style={styles.listItem}>- Manage your orders and payments</Text>
      <Section style={styles.buttonContainer}>
        <EmailButton href={loginUrl}>Get Started</EmailButton>
      </Section>
      <Text style={styles.text}>
        If you have any questions, feel free to reach out to our support team.
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

export default WelcomeEmail;
