import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { OrderCreatedRecipientEmailData } from '../../types/email.types';

export const OrderCreatedRecipientEmail = ({
  recipientName,
  senderPhone,
  orderReference,
  trackingId,
}: OrderCreatedRecipientEmailData) => {
  return (
    <EmailLayout preview={`You have a delivery coming! Order ${orderReference}`}>
      <Text style={styles.heading}>Delivery on the Way!</Text>
      <Text style={styles.text}>Hi {recipientName || 'there'},</Text>
      <Text style={styles.text}>
        Someone has created a delivery order for you. Here are the details:
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Order Reference: {orderReference}
        </Text>
        <Text style={styles.detailRow}>
          Sender Phone: {senderPhone}
        </Text>
        <Text style={styles.detailRow}>
          OTP: {trackingId}
        </Text>
      </Section>
      <Text style={styles.text}>
        You'll receive updates as the delivery progresses. Please ensure someone
        is available at the delivery location to receive the package.
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

export default OrderCreatedRecipientEmail;
