import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { EmailButton } from '../components/button';
import { emailStyles } from '../components/styles';
import { OrderStatusEmailData } from '../../types/email.types';

export const OrderStatusEmail = ({
  userName,
  orderReference,
  status,
  statusMessage,
  trackingInfo,
  trackingUrl,
}: OrderStatusEmailData) => {
  return (
    <EmailLayout preview={`Order ${orderReference} - ${status}`}>
      <Text style={emailStyles.eyebrow}>Order update</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {userName || 'there'},</Text>
      <Text style={emailStyles.text}>
        Your order has been updated:
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.eyebrow}>Now</Text>
        <Section style={emailStyles.statusContainer}>
          <StatusBadge status={status} />
        </Section>
        <Text style={emailStyles.textInk}>{statusMessage}</Text>
      </Section>
      {trackingUrl && (
        <Section style={emailStyles.buttonContainer}>
          <EmailButton href={trackingUrl}>Track your order</EmailButton>
        </Section>
      )}
      {trackingInfo && (trackingInfo.riderName || trackingInfo.riderPhone) && (
        <Section style={emailStyles.framedCard}>
          <Text style={emailStyles.subheading}>Rider information</Text>
          {trackingInfo.riderName && (
            <Text style={emailStyles.detailRow}>
              Name: {trackingInfo.riderName}
            </Text>
          )}
          {trackingInfo.riderPhone && (
            <Text style={emailStyles.detailRow}>
              Phone: {trackingInfo.riderPhone}
            </Text>
          )}
        </Section>
      )}
    </EmailLayout>
  );
};

export default OrderStatusEmail;
