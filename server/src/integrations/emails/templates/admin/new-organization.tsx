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
          <strong>Organization:</strong> {organizationName}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Admin Name:</strong> {adminName}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Email:</strong> {email}
        </Text>
        {phoneNumber && (
          <Text style={styles.detailRow}>
            <strong>Phone:</strong> {phoneNumber}
          </Text>
        )}
        <Text style={styles.detailRow}>
          <strong>Registered At:</strong> {formatDate(createdAt)}
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
  detailsBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
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
