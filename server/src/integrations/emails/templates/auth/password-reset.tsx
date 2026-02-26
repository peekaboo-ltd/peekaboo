import { Text, Section, CodeInline } from '@react-email/components';
import { EmailButton } from '../components/button';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { PasswordResetEmailData } from '../../types/email.types';

export const PasswordResetEmail = ({
  name,
  temporaryPassword,
  resetUrl,
}: PasswordResetEmailData) => {
  return (
    <EmailLayout preview="Your Peekaboo password has been reset">
      <Text style={styles.heading}>Password Reset</Text>
      <Text style={styles.text}>Hi {name || 'there'},</Text>
      {resetUrl ? (
        <>
          <Text style={styles.text}>
            We received a request to reset your password. Use the button below
            to choose a new one.
          </Text>
          <Section style={{ margin: '24px 0' }}>
            <EmailButton href={resetUrl}>Reset password</EmailButton>
          </Section>
          <Text style={styles.warningText}>
            This link expires shortly for your security.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>
            Your password has been reset. Please use the temporary password below to
            log in and set a new password immediately.
          </Text>
          <Section style={styles.codeContainer}>
            <CodeInline style={styles.code}>{temporaryPassword}</CodeInline>
          </Section>
          <Text style={styles.warningText}>
            For security reasons, please change this password as soon as you log in.
            Do not share this temporary password with anyone.
          </Text>
        </>
      )}
      <Text style={styles.text}>
        If you did not request a password reset, please contact our support team
        immediately.
      </Text>
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
  codeContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  code: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    letterSpacing: '4px',
    color: '#1a1a2e',
  },
  warningText: {
    fontSize: '13px',
    color: '#e65100',
    lineHeight: '20px',
    margin: '0 0 12px',
    fontStyle: 'italic' as const,
  },
};

export default PasswordResetEmail;
