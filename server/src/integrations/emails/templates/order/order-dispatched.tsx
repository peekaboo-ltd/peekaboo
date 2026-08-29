import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
import { OrderDispatchedEmailData } from '../../types/email.types';

export const OrderDispatchedEmail = ({
  userName,
  orderReference,
  trackingId,
}: OrderDispatchedEmailData) => {
  return (
    <EmailLayout preview={`Order ${orderReference} sent successfully`}>
      <Text style={emailStyles.eyebrow}>Order sent</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {userName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your delivery order has been sent successfully.
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Order reference: {orderReference}
        </Text>
        <Text style={emailStyles.detailRow}>
          OTP: {trackingId}
        </Text>
      </Section>
      <Text style={emailStyles.text}>
        Please keep your OTP safe and share it only with trusted parties.
      </Text>
      <Section style={emailStyles.buttonContainer}>
        <EmailButton href="https://peekaboo.co.rw/track">Track your order</EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default OrderDispatchedEmail;
