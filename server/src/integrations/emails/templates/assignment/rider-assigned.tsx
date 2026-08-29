import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.eyebrow}>New assignment</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {riderName || 'there'},</Text>
      <Text style={emailStyles.text}>
        You have been assigned a new delivery. Here are the details:
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Order reference: {orderReference}
        </Text>
        {pickupLocation && (
          <Text style={emailStyles.detailRow}>
            Pickup: {pickupLocation}
          </Text>
        )}
        {dropoffLocation && (
          <Text style={emailStyles.detailRow}>
            Dropoff: {dropoffLocation}
          </Text>
        )}
        {senderPhone && (
          <Text style={emailStyles.detailRow}>
            Sender phone: {senderPhone}
          </Text>
        )}
        {recipientPhone && (
          <Text style={emailStyles.detailRow}>
            Recipient phone: {recipientPhone}
          </Text>
        )}
      </Section>
      <Text style={emailStyles.text}>
        Please accept or reject this assignment as soon as possible.
      </Text>
    </EmailLayout>
  );
};

export default RiderAssignedEmail;
