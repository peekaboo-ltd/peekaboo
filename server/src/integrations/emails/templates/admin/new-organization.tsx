import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { NewOrganizationAdminEmailData } from '../../types/email.types';

export const NewOrganizationEmail = ({
  organizationName,
  adminName,
  email,
  phoneNumber,
  createdAt,
}: NewOrganizationAdminEmailData) => {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <EmailLayout preview={`New organization registered: ${organizationName}`}>
      <Text style={styles.heading}>New Organization Registered</Text>
      <Text style={styles.text}>
        A new organization has been registered on Peekaboo.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Organization: {organizationName}
        </Text>
        <Text style={styles.detailRow}>
          Admin Name: {adminName}
        </Text>
        <Text style={styles.detailRow}>
          Email: {email}
        </Text>
        {phoneNumber && (
          <Text style={styles.detailRow}>
            Phone: {phoneNumber}
          </Text>
        )}
        <Text style={styles.detailRow}>
          Registered At: {formatDate(createdAt)}
        </Text>
      </Section>
      <Text style={styles.text}>
        Please review and approve this organization in the admin dashboard.
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
  detailsBox: {
    backgroundColor: '#f7f7f7',
    padding: '16px',
    margin: '16px 0',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
};

export default NewOrganizationEmail;
