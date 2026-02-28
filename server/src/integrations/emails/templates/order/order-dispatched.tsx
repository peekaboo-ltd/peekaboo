import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { OrderDispatchedEmailData } from '../../types/email.types';

export const OrderDispatchedEmail = ({
  userName,
  orderReference,
  trackingId,
}: OrderDispatchedEmailData) => {
  return (
    <EmailLayout preview={`Order ${orderReference} sent successfully`}>
      <Text style={styles.heading}>Order Sent Successfully</Text>
      <Text style={styles.text}>Hi {userName || 'there'},</Text>
      <Text style={styles.text}>
        Your delivery order <strong>{orderReference}</strong> has been sent successfully.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <strong>Order Reference:</strong> {orderReference}
        </Text>
        <Text style={styles.detailRow}>
          <strong>OTP:</strong> {trackingId}
        </Text>
      </Section>
      <Text style={styles.text}>
        Please keep your OTP safe and share it only with trusted parties.
      </Text>
      <Section style={styles.buttonContainer}>
        <EmailButton href="https://peekaboo.co.rw">Visit Peekaboo</EmailButton>
      </Section>
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
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0 12px',
  },
};

export default OrderDispatchedEmail;
