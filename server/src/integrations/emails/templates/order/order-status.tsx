import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { OrderStatusEmailData } from '../../types/email.types';

export const OrderStatusEmail = ({
  userName,
  orderReference,
  status,
  statusMessage,
  trackingInfo,
}: OrderStatusEmailData) => {
  return (
    <EmailLayout preview={`Order ${orderReference} - ${status}`}>
      <Text style={styles.heading}>Order Update</Text>
      <Text style={styles.text}>Hi {userName || 'there'},</Text>
      <Text style={styles.text}>
        Your order <strong>{orderReference}</strong> has been updated:
      </Text>
      <Section style={styles.statusContainer}>
        <StatusBadge status={status} />
      </Section>
      <Text style={styles.text}>{statusMessage}</Text>
      {trackingInfo && (trackingInfo.riderName || trackingInfo.riderPhone) && (
        <Section style={styles.detailsBox}>
          <Text style={styles.detailHeading}>Rider Information</Text>
          {trackingInfo.riderName && (
            <Text style={styles.detailRow}>
              <strong>Name:</strong> {trackingInfo.riderName}
            </Text>
          )}
          {trackingInfo.riderPhone && (
            <Text style={styles.detailRow}>
              <strong>Phone:</strong> {trackingInfo.riderPhone}
            </Text>
          )}
        </Section>
      )}
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
  statusContainer: {
    textAlign: 'center' as const,
    margin: '16px 0',
  },
  detailsBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  detailHeading: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
};

export default OrderStatusEmail;
