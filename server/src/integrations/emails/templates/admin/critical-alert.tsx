import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { CriticalAlertEmailData } from '../../types/email.types';

export const CriticalAlertEmail = ({
  alertType,
  message,
  details,
  timestamp,
}: CriticalAlertEmailData) => {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <EmailLayout preview={`Critical Alert: ${alertType}`}>
      <Text style={emailStyles.heading}>Critical alert</Text>
      <Section style={emailStyles.framedCard}>
        <Section style={emailStyles.statusContainer}>
          <StatusBadge status="FAILED" />
        </Section>
        <Text style={emailStyles.alertType}>{alertType}</Text>
        <Text style={emailStyles.alertMessage}>{message}</Text>
        {details && (
          <Text style={emailStyles.alertDetails}>{details}</Text>
        )}
        <Text style={emailStyles.timestamp}>
          {formatDate(timestamp)}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        Please investigate this issue immediately via the admin dashboard.
      </Text>
    </EmailLayout>
  );
};

export default CriticalAlertEmail;
