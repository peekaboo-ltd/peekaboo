import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { DailySummaryEmailData } from '../../types/email.types';

export const DailySummaryEmail = ({
  date,
  totalOrders,
  totalRevenue,
  newOrganizations,
  activeRiders,
  pendingPayments,
}: DailySummaryEmailData) => {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <EmailLayout preview={`Peekaboo Daily Summary - ${formatDate(date)}`}>
      <Text style={styles.heading}>Daily Summary</Text>
      <Text style={styles.text}>{formatDate(date)}</Text>
      <Section style={styles.metricsContainer}>
        <Section style={styles.metricBox}>
          <Text style={styles.metricValue}>{totalOrders}</Text>
          <Text style={styles.metricLabel}>Total Orders</Text>
        </Section>
        <Section style={styles.metricBox}>
          <Text style={styles.metricValue}>
            RWF {totalRevenue?.toLocaleString()}
          </Text>
          <Text style={styles.metricLabel}>Revenue</Text>
        </Section>
        <Section style={styles.metricBox}>
          <Text style={styles.metricValue}>{newOrganizations}</Text>
          <Text style={styles.metricLabel}>New Organizations</Text>
        </Section>
        <Section style={styles.metricBox}>
          <Text style={styles.metricValue}>{activeRiders}</Text>
          <Text style={styles.metricLabel}>Active Riders</Text>
        </Section>
        <Section style={styles.metricBox}>
          <Text style={styles.metricValue}>{pendingPayments}</Text>
          <Text style={styles.metricLabel}>Pending Payments</Text>
        </Section>
      </Section>
      <Text style={styles.text}>
        Visit the admin dashboard for detailed analytics.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  text: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  metricsContainer: {
    margin: '16px 0',
  },
  metricBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '8px 0',
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    margin: '0',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#8898aa',
    margin: '4px 0 0',
    textTransform: 'uppercase' as const,
  },
};

export default DailySummaryEmail;
