import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Account activated</Text>
      <Text style={emailStyles.text}>Hi {adminName},</Text>
      <Text style={emailStyles.text}>
        Congratulations! Your organization {organizationName}{' '}
        has been successfully set up on Peekaboo.
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="ACTIVATED" />
      </Section>
      <Text style={emailStyles.text}>Here's what you can do now:</Text>
      <Text style={emailStyles.listItem}>- Invite team members to your organization</Text>
      <Text style={emailStyles.listItem}>- Create and manage delivery orders</Text>
      <Text style={emailStyles.listItem}>- Track billing and invoices</Text>
      <Text style={emailStyles.listItem}>- View delivery analytics</Text>
      <Section style={emailStyles.buttonContainer}>
        <EmailButton href={`${baseUrl}/dashboard`}>Go to dashboard</EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default OnboardingCompleteEmail;
