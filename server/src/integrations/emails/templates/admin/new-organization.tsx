import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>New organization registered</Text>
      <Text style={emailStyles.text}>
        A new organization has been registered on Peekaboo.
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Organization: {organizationName}
        </Text>
        <Text style={emailStyles.detailRow}>
          Admin name: {adminName}
        </Text>
        <Text style={emailStyles.detailRow}>
          Email: {email}
        </Text>
        {phoneNumber && (
          <Text style={emailStyles.detailRow}>
            Phone: {phoneNumber}
          </Text>
        )}
        <Text style={emailStyles.detailRow}>
          Registered at: {formatDate(createdAt)}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        Please review and approve this organization in the admin dashboard.
      </Text>
    </EmailLayout>
  );
};

export default NewOrganizationEmail;
