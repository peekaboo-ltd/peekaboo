import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
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
      <Text style={styles.heading}>
        Assignment {isAccepted ? 'Accepted' : 'Update'}
      </Text>
      <Text style={styles.text}>Hi {userName || 'there'},</Text>
      {isAccepted ? (
        <Text style={styles.text}>
          {riderName} has accepted the delivery assignment for
          order {orderReference}. Your delivery is being
          processed.
        </Text>
      ) : (
        <Text style={styles.text}>
          The rider for order {orderReference} was unable to
          accept the assignment. A new rider is being assigned automatically.
        </Text>
      )}
      <Text style={styles.text}>
        You'll receive updates as the delivery progresses.
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
};

export default AssignmentStatusEmail;
