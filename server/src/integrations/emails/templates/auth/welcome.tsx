import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
import { WelcomeEmailData } from '../../types/email.types';

export const WelcomeEmail = ({ name, loginUrl }: WelcomeEmailData) => {
  return (
    <EmailLayout preview={`Welcome to Peekaboo, ${name}!`}>
      <Text style={emailStyles.heading}>Welcome to Peekaboo!</Text>
      <Text style={emailStyles.text}>Hi {name},</Text>
      <Text style={emailStyles.text}>
        Thank you for creating your Peekaboo account. We're excited to have you
        on board! With Peekaboo, you can easily send and receive deliveries
        across Kigali.
      </Text>
      <Text style={emailStyles.text}>
        Here's what you can do with your account:
      </Text>
      <Text style={emailStyles.listItem}>- Send packages to anyone in Kigali</Text>
      <Text style={emailStyles.listItem}>- Track your deliveries in real-time</Text>
      <Text style={emailStyles.listItem}>- Manage your orders and payments</Text>
      <Section style={emailStyles.buttonContainer}>
        <EmailButton href={loginUrl}>Get Started</EmailButton>
      </Section>
      <Text style={emailStyles.text}>
        If you have any questions, feel free to reach out to our support team.
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
