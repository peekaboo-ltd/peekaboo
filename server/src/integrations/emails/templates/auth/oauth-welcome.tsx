import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Welcome to Peekaboo!</Text>
      <Text style={emailStyles.text}>Hi {name},</Text>
      <Text style={emailStyles.text}>
        Your Peekaboo account has been created using your {provider} account.
        You can now sign in at any time using {provider}.
      </Text>
      <Text style={emailStyles.text}>
        With Peekaboo, you can easily send and receive deliveries across Kigali.
      </Text>
      <Section style={emailStyles.buttonContainer}>
        <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default OAuthWelcomeEmail;
