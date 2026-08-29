import { Text, Section, CodeInline } from '@react-email/components';
import { EmailButton } from '../components/button';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { PasswordResetEmailData } from '../../types/email.types';

export const PasswordResetEmail = ({
  name,
  temporaryPassword,
  resetUrl,
}: PasswordResetEmailData) => {
  return (
    <EmailLayout preview="Your Peekaboo password has been reset">
      <Text style={emailStyles.heading}>Password Reset</Text>
      <Text style={emailStyles.text}>Hi {name || 'there'},</Text>
      {resetUrl ? (
        <>
          <Text style={emailStyles.text}>
            We received a request to reset your password. Use the button below
            to choose a new one.
          </Text>
          <Section style={emailStyles.buttonContainer}>
            <EmailButton href={resetUrl}>Reset password</EmailButton>
          </Section>
          <Text style={emailStyles.warningText}>
            ⚠ This link expires shortly for your security.
          </Text>
        </>
      ) : (
        <>
          <Text style={emailStyles.text}>
            Your password has been reset. Please use the temporary password below to
            log in and set a new password immediately.
          </Text>
          <Section style={{ ...emailStyles.quietCard, textAlign: 'center' as const }}>
            <CodeInline style={emailStyles.code}>{temporaryPassword}</CodeInline>
          </Section>
          <Text style={emailStyles.warningText}>
            ⚠ For security reasons, please change this password as soon as you log in.
            Do not share this temporary password with anyone.
          </Text>
        </>
      )}
      <Text style={emailStyles.text}>
        If you did not request a password reset, please contact our support team
        immediately.
      </Text>
    </EmailLayout>
  );
};

export default PasswordResetEmail;
