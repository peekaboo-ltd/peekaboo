import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
import { OnboardingInviteEmailData } from '../../types/email.types';

export const OnboardingInviteEmail = ({
  organizationName,
  adminName,
  inviteToken,
}: OnboardingInviteEmailData) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const inviteLink = `${baseUrl}/onboarding/complete?token=${inviteToken}`;

  return (
    <EmailLayout
      preview={`Complete your Peekaboo account setup - ${organizationName}`}
    >
      <Text style={emailStyles.heading}>You're invited!</Text>
      <Text style={emailStyles.text}>Hi {adminName},</Text>
      <Text style={emailStyles.text}>
        You've been invited to set up {organizationName} on
        Peekaboo. As the organization administrator, you'll be able to manage
        members, orders, and billing.
      </Text>
      <Text style={emailStyles.text}>
        Click the button below to complete your account setup:
      </Text>
      <Section style={emailStyles.buttonContainer}>
        <EmailButton href={inviteLink}>Complete setup</EmailButton>
      </Section>
      <Text style={emailStyles.warningText}>
        ⚠ This invitation link expires in 7 days. If you did not expect this
        invitation, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
};

export default OnboardingInviteEmail;
