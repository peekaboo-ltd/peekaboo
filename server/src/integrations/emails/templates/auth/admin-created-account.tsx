import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { AdminCreatedAccountEmailData } from '../../types/email.types';

export const AdminCreatedAccountEmail = ({
  name,
  temporaryPassword,
  roles,
  loginUrl,
}: AdminCreatedAccountEmailData) => {
  return (
    <EmailLayout preview={`Your Peekaboo account has been created`}>
      <Text style={styles.heading}>Your Account Has Been Created</Text>
      <Text style={styles.text}>Hi {name || 'there'},</Text>
      <Text style={styles.text}>
        An administrator has created a Peekaboo account for you. You can now log
        in and start using the platform.
      </Text>

      <Section style={styles.credentialsBox}>
        <Text style={styles.credentialsTitle}>Your Login Credentials</Text>
        <Text style={styles.credentialItem}>
          Temporary Password:{' '}
          <span style={styles.code}>{temporaryPassword}</span>
        </Text>
      </Section>

      {roles && roles.length > 0 && (
        <>
          <Text style={styles.text}>
            You have been assigned the following role{roles.length > 1 ? 's' : ''}:
          </Text>
          {roles.map((role, index) => (
            <Text key={index} style={styles.roleItem}>
              - {role}
            </Text>
          ))}
        </>
      )}

      <Section style={styles.warningBox}>
        <Text style={styles.warningText}>
          For your security, please change your password immediately after your
          first login. Temporary passwords are not meant to be used long-term.
        </Text>
      </Section>

      <Section style={styles.buttonContainer}>
        <EmailButton href={loginUrl}>Log In Now</EmailButton>
      </Section>

      <Text style={styles.text}>
        If you did not expect this account or have any questions, please contact
        our support team.
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
  credentialsBox: {
    backgroundColor: '#f7fafc',
    padding: '16px 20px',
    margin: '16px 0',
  },
  credentialsTitle: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  credentialItem: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0',
  },
  code: {
    backgroundColor: '#edf2f7',
    padding: '2px 6px',
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#1a1a2e',
  },
  roleItem: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 4px',
    paddingLeft: '8px',
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    padding: '12px 16px',
    margin: '16px 0',
  },
  warningText: {
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '20px',
    margin: '0',
    fontWeight: '500' as const,
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
};

export default AdminCreatedAccountEmail;
