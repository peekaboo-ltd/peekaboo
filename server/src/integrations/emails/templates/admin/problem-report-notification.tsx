import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { ProblemReportAdminEmailData } from '../../types/email.types';

export const ProblemReportNotificationEmail = ({
  riderId,
  riderName,
  riderPhoneNumber,
  submissionType,
  capturedAt,
  locationLabel,
  description,
  evidenceUrl,
  submittedAt,
}: ProblemReportAdminEmailData) => {
  const fmt = (value: Date | string) =>
    new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <EmailLayout preview={`New rider problem report from ${riderName}`}>
      <Text style={emailStyles.heading}>New rider problem report</Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>Submission type: {submissionType}</Text>
        <Text style={emailStyles.detailRow}>Rider: {riderName}</Text>
        <Text style={emailStyles.detailRow}>Rider ID: {riderId}</Text>
        <Text style={emailStyles.detailRow}>Phone: {riderPhoneNumber || 'N/A'}</Text>
        <Text style={emailStyles.detailRow}>Captured at: {fmt(capturedAt)}</Text>
        <Text style={emailStyles.detailRow}>Submitted at: {fmt(submittedAt)}</Text>
        <Text style={emailStyles.detailRow}>Location: {locationLabel || 'Location unavailable'}</Text>
        <Text style={emailStyles.detailRow}>Description: {description}</Text>
        <Text style={emailStyles.detailRow}>
          Evidence URL:{' '}
          <Link href={evidenceUrl} style={emailStyles.link}>
            Open media
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default ProblemReportNotificationEmail;
