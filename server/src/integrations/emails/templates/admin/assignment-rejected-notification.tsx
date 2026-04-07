import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { AssignmentRejectedAdminEmailData } from '../../types/email.types';

export const AssignmentRejectedNotificationEmail = ({
  orderReference,
  orderId,
  assignmentId,
  riderId,
  riderName,
  riderPhone,
  rejectedAt,
  newAssignmentId,
  reassignedRiderId,
  reassignedRiderName,
  reassignedRiderPhone,
}: AssignmentRejectedAdminEmailData) => {
  const fmt = (value: Date | string) =>
    new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <EmailLayout preview={`Rider rejected assignment for order ${orderReference}`}>
      <Text style={styles.heading}>Assignment rejected — action may be needed</Text>
      <Text style={styles.lead}>
        A rider has rejected a delivery assignment. A replacement assignment has been created
        automatically when possible; please review routing and rider capacity in the admin
        dashboard if issues persist.
      </Text>
      <Section style={styles.alertBox}>
        <Text style={styles.alertLabel}>Order</Text>
        <Text style={styles.row}>Reference: {orderReference}</Text>
        <Text style={styles.rowMono}>Order ID: {orderId}</Text>
        <Text style={styles.rowMono}>Assignment ID: {assignmentId}</Text>
      </Section>
      <Section style={styles.detailsBox}>
        <Text style={styles.sectionTitle}>Rider who rejected</Text>
        <Text style={styles.row}>Name: {riderName}</Text>
        <Text style={styles.row}>Rider ID: {riderId || 'N/A'}</Text>
        <Text style={styles.row}>Phone: {riderPhone || 'N/A'}</Text>
        <Text style={styles.row}>Rejected at: {fmt(rejectedAt)}</Text>
      </Section>
      {newAssignmentId && (
        <Section style={styles.detailsBox}>
          <Text style={styles.sectionTitle}>Reassigned to (new assignment)</Text>
          <Text style={styles.rowMono}>New assignment ID: {newAssignmentId}</Text>
          {reassignedRiderId || reassignedRiderName ? (
            <>
              <Text style={styles.row}>Name: {reassignedRiderName || 'N/A'}</Text>
              <Text style={styles.row}>Rider ID: {reassignedRiderId || 'N/A'}</Text>
              <Text style={styles.row}>Phone: {reassignedRiderPhone || 'N/A'}</Text>
            </>
          ) : (
            <Text style={styles.row}>Rider: pending / unassigned</Text>
          )}
        </Section>
      )}
      <Text style={styles.footerNote}>
        This notification was sent to management because an assignment was rejected. If you are
        not the right contact, update ADMIN_NOTIFICATION_EMAIL in your server configuration.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: '500' as const,
    color: '#c62828',
    margin: '0 0 12px',
  },
  lead: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '22px',
    margin: '0 0 16px',
  },
  alertBox: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #c62828',
    padding: '16px',
    margin: '0 0 16px',
  },
  alertLabel: {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#c62828',
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
    letterSpacing: '0.04em',
  },
  detailsBox: {
    backgroundColor: '#f7f7f7',
    padding: '16px',
    margin: '0 0 16px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    margin: '0 0 10px',
  },
  row: {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '22px',
    margin: '0 0 6px',
  },
  rowMono: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '20px',
    margin: '0 0 6px',
    fontFamily: 'ui-monospace, monospace',
  },
  footerNote: {
    fontSize: '12px',
    color: '#8898aa',
    lineHeight: '18px',
    margin: '16px 0 0',
  },
};

export default AssignmentRejectedNotificationEmail;
