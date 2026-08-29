import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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

  const metrics = [
    { label: 'Total orders', value: String(totalOrders) },
    { label: 'Revenue', value: `RWF ${totalRevenue?.toLocaleString()}` },
    { label: 'New organizations', value: String(newOrganizations) },
    { label: 'Active riders', value: String(activeRiders) },
    { label: 'Pending payments', value: String(pendingPayments) },
  ];

  return (
    <EmailLayout preview={`Peekaboo Daily Summary - ${formatDate(date)}`}>
      <Text style={emailStyles.heading}>Daily summary</Text>
      <Text style={emailStyles.text}>{formatDate(date)}</Text>
      <Section style={emailStyles.metricsContainer}>
        {metrics.map((metric) => (
          <Section key={metric.label} style={emailStyles.metricBox}>
            <Text style={emailStyles.metricValue}>{metric.value}</Text>
            <Text style={emailStyles.metricLabel}>{metric.label}</Text>
          </Section>
        ))}
      </Section>
      <Text style={emailStyles.text}>
        Visit the admin dashboard for detailed analytics.
      </Text>
    </EmailLayout>
  );
};

export default DailySummaryEmail;
