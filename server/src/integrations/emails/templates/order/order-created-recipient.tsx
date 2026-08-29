import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { OrderCreatedRecipientEmailData } from '../../types/email.types';

export const OrderCreatedRecipientEmail = ({
  recipientName,
  senderPhone,
  orderReference,
  trackingId,
}: OrderCreatedRecipientEmailData) => {
  return (
    <EmailLayout preview={`You have a delivery coming! Order ${orderReference}`}>
      <Text style={emailStyles.eyebrow}>Delivery on the way</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {recipientName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Someone has created a delivery order for you. Here are the details:
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Order reference: {orderReference}
        </Text>
        <Text style={emailStyles.detailRow}>
          Sender phone: {senderPhone}
        </Text>
        <Text style={emailStyles.detailRow}>
          OTP: {trackingId}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        You'll receive updates as the delivery progresses. Please ensure someone
        is available at the delivery location to receive the package.
      </Text>
    </EmailLayout>
  );
};

export default OrderCreatedRecipientEmail;
