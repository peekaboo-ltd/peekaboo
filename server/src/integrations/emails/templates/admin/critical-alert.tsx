import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
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
      <Text style={styles.heading}>Critical Alert</Text>
      <Section style={styles.alertBox}>
        <Text style={styles.alertType}>{alertType}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        {details && (
          <Text style={styles.alertDetails}>{details}</Text>
        )}
        <Text style={styles.timestamp}>
          {formatDate(timestamp)}
        </Text>
      </Section>
      <Text style={styles.text}>
        Please investigate this issue immediately via the admin dashboard.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#c62828',
    margin: '0 0 16px',
  },
  alertBox: {
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    borderLeft: '4px solid #c62828',
  },
  alertType: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#c62828',
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
  },
  alertMessage: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '0 0 8px',
  },
  alertDetails: {
    fontSize: '13px',
    color: '#718096',
    margin: '0 0 8px',
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: '12px',
    color: '#8898aa',
    margin: '8px 0 0',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
};

export default CriticalAlertEmail;
