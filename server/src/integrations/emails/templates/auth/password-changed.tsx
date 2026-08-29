import { Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { PasswordChangedEmailData } from '../../types/email.types';

export const PasswordChangedEmail = ({ name }: PasswordChangedEmailData) => {
  return (
    <EmailLayout preview="Your Peekaboo password has been changed">
      <Text style={emailStyles.heading}>Password Changed</Text>
      <Text style={emailStyles.text}>Hi {name || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your Peekaboo account password has been successfully changed.
      </Text>
      <Text style={emailStyles.text}>
        If you did not make this change, please contact our support team
        immediately at{' '}
        <a href="mailto:support@peekaboo.co.rw" style={emailStyles.link}>
          support@peekaboo.co.rw
        </a>
        .
      </Text>
    </EmailLayout>
  );
};

export default PasswordChangedEmail;
