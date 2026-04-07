import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
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
      <Text style={styles.heading}>You're Invited!</Text>
      <Text style={styles.text}>Hi {adminName},</Text>
      <Text style={styles.text}>
        You've been invited to set up {organizationName} on
        Peekaboo. As the organization administrator, you'll be able to manage
        members, orders, and billing.
      </Text>
      <Text style={styles.text}>
        Click the button below to complete your account setup:
      </Text>
      <Section style={styles.buttonContainer}>
        <EmailButton href={inviteLink}>Complete Setup</EmailButton>
      </Section>
      <Text style={styles.warningText}>
        This invitation link expires in 7 days. If you did not expect this
        invitation, you can safely ignore this email.
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
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  warningText: {
    fontSize: '12px',
    color: '#8898aa',
    lineHeight: '20px',
    margin: '16px 0 0',
    fontStyle: 'italic' as const,
  },
};

export default OnboardingInviteEmail;
