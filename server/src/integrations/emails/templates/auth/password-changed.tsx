import { Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { PasswordChangedEmailData } from '../../types/email.types';

export const PasswordChangedEmail = ({ name }: PasswordChangedEmailData) => {
  return (
    <EmailLayout preview="Your Peekaboo password has been changed">
      <Text style={styles.heading}>Password Changed</Text>
      <Text style={styles.text}>Hi {name || 'there'},</Text>
      <Text style={styles.text}>
        Your Peekaboo account password has been successfully changed.
      </Text>
      <Text style={styles.text}>
        If you did not make this change, please contact our support team
        immediately at{' '}
        <a href="mailto:support@peekaboo.co.rw" style={styles.link}>
          support@peekaboo.co.rw
        </a>
        .
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
  link: {
    color: '#1a1a2e',
    textDecoration: 'underline' as const,
  },
};

export default PasswordChangedEmail;
