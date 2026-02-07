import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { RiderAssignedEmailData } from '../../types/email.types';

export const RiderAssignedEmail = ({
  riderName,
  orderReference,
  pickupLocation,
  dropoffLocation,
  senderPhone,
  recipientPhone,
}: RiderAssignedEmailData) => {
  return (
    <EmailLayout
      preview={`New delivery assignment: Order ${orderReference}`}
    >
      <Text style={styles.heading}>New Delivery Assignment</Text>
      <Text style={styles.text}>Hi {riderName || 'there'},</Text>
      <Text style={styles.text}>
        You have been assigned a new delivery. Here are the details:
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Order Reference:</strong> {orderReference}
        </Text>
        {pickupLocation && (
          <Text style={styles.detailRow}>
            <strong>Pickup:</strong> {pickupLocation}
          </Text>
        )}
        {dropoffLocation && (
          <Text style={styles.detailRow}>
            <strong>Dropoff:</strong> {dropoffLocation}
          </Text>
        )}
        {senderPhone && (
          <Text style={styles.detailRow}>
            <strong>Sender Phone:</strong> {senderPhone}
          </Text>
        )}
        {recipientPhone && (
          <Text style={styles.detailRow}>
            <strong>Recipient Phone:</strong> {recipientPhone}
          </Text>
        )}
      </Section>
      <Text style={styles.text}>
        Please accept or reject this assignment as soon as possible.
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

export default RiderAssignedEmail;
