import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.eyebrow}>Order created</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {senderName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your delivery order has been created successfully. Here are the details:
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Order reference: {orderReference}
        </Text>
        <Text style={emailStyles.detailRow}>
          Recipient phone: {recipientPhone}
        </Text>
        <Text style={emailStyles.detailRow}>
          OTP: {trackingId}
        </Text>
        <Text style={emailStyles.amountRow}>
          Delivery fee: {currency} {fee?.toLocaleString()}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        You'll receive updates as your order progresses. Please proceed with
        payment to confirm your delivery.
      </Text>
    </EmailLayout>
  );
};

export default OrderCreatedSenderEmail;
