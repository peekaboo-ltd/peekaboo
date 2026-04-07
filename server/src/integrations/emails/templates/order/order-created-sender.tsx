import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { OrderCreatedSenderEmailData } from '../../types/email.types';

export const OrderCreatedSenderEmail = ({
  senderName,
  recipientPhone,
  orderReference,
  trackingId,
  fee,
  currency,
}: OrderCreatedSenderEmailData) => {
  return (
    <EmailLayout preview={`Order ${orderReference} created successfully`}>
      <Text style={styles.heading}>Order Created</Text>
      <Text style={styles.text}>Hi {senderName || 'there'},</Text>
      <Text style={styles.text}>
        Your delivery order has been created successfully. Here are the details:
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Order Reference: {orderReference}
        </Text>
        <Text style={styles.detailRow}>
          Recipient Phone: {recipientPhone}
        </Text>
        <Text style={styles.detailRow}>
          OTP: {trackingId}
        </Text>
        <Text style={styles.detailRow}>
          Delivery Fee: {currency} {fee?.toLocaleString()}
        </Text>
      </Section>
      <Text style={styles.text}>
        You'll receive updates as your order progresses. Please proceed with
        payment to confirm your delivery.
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

export default OrderCreatedSenderEmail;
