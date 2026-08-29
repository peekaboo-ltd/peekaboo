import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
import { AdminCreatedAccountEmailData } from '../../types/email.types';

export const AdminCreatedAccountEmail = ({
  name,
  temporaryPassword,
  roles,
  loginUrl,
}: AdminCreatedAccountEmailData) => {
  return (
    <EmailLayout preview={`Your Peekaboo account has been created`}>
      <Text style={emailStyles.heading}>Your Account Has Been Created</Text>
      <Text style={emailStyles.text}>Hi {name || 'there'},</Text>
      <Text style={emailStyles.text}>
        An administrator has created a Peekaboo account for you. You can now log
        in and start using the platform.
      </Text>

      <Section style={emailStyles.quietCard}>
        <Text style={emailStyles.subheading}>Your login credentials</Text>
        <Text style={emailStyles.detailRow}>
          Temporary password:{' '}
          <span style={emailStyles.code}>{temporaryPassword}</span>
        </Text>
      </Section>

      {roles && roles.length > 0 && (
        <>
          <Text style={emailStyles.text}>
            You have been assigned the following role{roles.length > 1 ? 's' : ''}:
          </Text>
          {roles.map((role, index) => (
            <Text key={index} style={emailStyles.listItem}>
              - {role}
            </Text>
          ))}
        </>
      )}

      <Text style={emailStyles.warningText}>
        ⚠ For your security, please change your password immediately after your
        first login. Temporary passwords are not meant to be used long-term.
      </Text>

      <Section style={emailStyles.buttonContainer}>
        <EmailButton href={loginUrl}>Log In Now</EmailButton>
      </Section>

      <Text style={emailStyles.text}>
        If you did not expect this account or have any questions, please contact
        our support team.
      </Text>
    </EmailLayout>
  );
};

export default AdminCreatedAccountEmail;
