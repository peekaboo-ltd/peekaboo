import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { OrganizationStatusEmailData } from '../../types/email.types';

export const OrgStatusChangedEmail = ({
  organizationName,
  adminName,
  status,
  reason,
}: OrganizationStatusEmailData) => {
  const isActive = status === 'ACTIVE';

  return (
    <EmailLayout
      preview={`${organizationName} has been ${isActive ? 'activated' : 'suspended'}`}
    >
      <Text style={emailStyles.heading}>
        Organization {isActive ? 'activated' : 'suspended'}
      </Text>
      <Text style={emailStyles.text}>Hi {adminName},</Text>
      <Text style={emailStyles.text}>
        Your organization {organizationName} has been{' '}
        {isActive ? 'activated' : 'suspended'} on Peekaboo.
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status={isActive ? 'ACTIVATED' : 'SUSPENDED'} />
      </Section>
      {reason && (
        <Section style={emailStyles.framedCard}>
          <Text style={emailStyles.detailRow}>
            Reason: {reason}
          </Text>
        </Section>
      )}
      {isActive ? (
        <Text style={emailStyles.text}>
          You can now resume using all Peekaboo services for your organization.
        </Text>
      ) : (
        <Text style={emailStyles.text}>
          While suspended, your organization members will not be able to create
          new orders. Please contact our support team for more information.
        </Text>
      )}
    </EmailLayout>
  );
};

export default OrgStatusChangedEmail;
