import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { AssignmentNotificationEmailData } from '../../types/email.types';

export const AssignmentNotificationEmail = ({
  userName,
  orderReference,
  riderName,
  riderPhone,
}: AssignmentNotificationEmailData) => {
  return (
    <EmailLayout
      preview={`Rider assigned to your order ${orderReference}`}
    >
      <Text style={emailStyles.eyebrow}>Rider assigned</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {userName || 'there'},</Text>
      <Text style={emailStyles.text}>
        A rider has been assigned to your order.
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.subheading}>Rider information</Text>
        <Text style={emailStyles.detailRow}>
          Rider name: {riderName}
        </Text>
        {riderPhone && (
          <Text style={emailStyles.detailRow}>
            Rider phone: {riderPhone}
          </Text>
        )}
      </Section>
      <Text style={emailStyles.text}>
        You'll receive further updates as the delivery progresses.
      </Text>
    </EmailLayout>
  );
};

export default AssignmentNotificationEmail;
