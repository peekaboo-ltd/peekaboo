import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { StatusBadge } from '../components/status-badge';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>Assignment rejected — action may be needed</Text>
      <Text style={emailStyles.lead}>
        A rider has rejected a delivery assignment. A replacement assignment has been created
        automatically when possible; please review routing and rider capacity in the admin
        dashboard if issues persist.
      </Text>
      <Section style={emailStyles.statusContainer}>
        <StatusBadge status="REJECTED" />
      </Section>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.sectionTitle}>Order</Text>
        <Text style={emailStyles.detailRow}>Reference: {orderReference}</Text>
        <Text style={emailStyles.detailRow}>Order ID: {orderId}</Text>
        <Text style={emailStyles.detailRow}>Assignment ID: {assignmentId}</Text>
      </Section>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.sectionTitle}>Rider who rejected</Text>
        <Text style={emailStyles.detailRow}>Name: {riderName}</Text>
        <Text style={emailStyles.detailRow}>Rider ID: {riderId || 'N/A'}</Text>
        <Text style={emailStyles.detailRow}>Phone: {riderPhone || 'N/A'}</Text>
        <Text style={emailStyles.detailRow}>Rejected at: {fmt(rejectedAt)}</Text>
      </Section>
      {newAssignmentId && (
        <Section style={emailStyles.framedCard}>
          <Text style={emailStyles.sectionTitle}>Reassigned to (new assignment)</Text>
          <Text style={emailStyles.detailRow}>New assignment ID: {newAssignmentId}</Text>
          {reassignedRiderId || reassignedRiderName ? (
            <>
              <Text style={emailStyles.detailRow}>Name: {reassignedRiderName || 'N/A'}</Text>
              <Text style={emailStyles.detailRow}>Rider ID: {reassignedRiderId || 'N/A'}</Text>
              <Text style={emailStyles.detailRow}>Phone: {reassignedRiderPhone || 'N/A'}</Text>
            </>
          ) : (
            <Text style={emailStyles.detailRow}>Rider: pending / unassigned</Text>
          )}
        </Section>
      )}
      <Text style={emailStyles.footerNote}>
        This notification was sent to management because an assignment was rejected. If you are
        not the right contact, update ADMIN_NOTIFICATION_EMAIL in your server configuration.
      </Text>
    </EmailLayout>
  );
};

export default AssignmentRejectedNotificationEmail;
