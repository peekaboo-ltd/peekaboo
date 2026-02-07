import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { AssignmentNotificationEmailData } from '../../types/email.types';

export const AssignmentNotificationEmail = ({
  userName,
  orderReference,
  riderName,
  riderPhone,
}: AssignmentNotificationEmailData) => {
  return (
    <EmailLayout
      preview={`Rider assigned to your order ${orderReference}`}
    >
      <Text style={styles.heading}>Rider Assigned</Text>
      <Text style={styles.text}>Hi {userName || 'there'},</Text>
      <Text style={styles.text}>
        A rider has been assigned to your order{' '}
        <strong>{orderReference}</strong>.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Rider Name:</strong> {riderName}
        </Text>
        {riderPhone && (
          <Text style={styles.detailRow}>
            <strong>Rider Phone:</strong> {riderPhone}
          </Text>
        )}
      </Section>
      <Text style={styles.text}>
        You'll receive further updates as the delivery progresses.
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
    backgroundColor: '#e3f2fd',
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

export default AssignmentNotificationEmail;
