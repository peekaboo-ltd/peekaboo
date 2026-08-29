import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
import { AssignmentStatusEmailData } from '../../types/email.types';

export const AssignmentStatusEmail = ({
  userName,
  orderReference,
  riderName,
  status,
}: AssignmentStatusEmailData) => {
  const isAccepted = status === 'accepted';

  return (
    <EmailLayout
      preview={`Rider ${isAccepted ? 'accepted' : 'declined'} order ${orderReference}`}
    >
      <Text style={emailStyles.eyebrow}>Assignment update</Text>
      <Text style={emailStyles.heading}>{orderReference}</Text>
      <Text style={emailStyles.text}>Hi {userName || 'there'},</Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status={isAccepted ? 'ACCEPTED' : 'REJECTED'} />
      </Section>
      {isAccepted ? (
        <Text style={emailStyles.text}>
          {riderName} has accepted the delivery assignment for
          order {orderReference}. Your delivery is being
          processed.
        </Text>
      ) : (
        <Text style={emailStyles.text}>
          The rider for order {orderReference} was unable to
          accept the assignment. A new rider is being assigned automatically.
        </Text>
      )}
      <Text style={emailStyles.text}>
        You'll receive updates as the delivery progresses.
      </Text>
    </EmailLayout>
  );
};

export default AssignmentStatusEmail;
