import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
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
      <Text style={styles.heading}>New Rider Problem Report</Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.row}>Submission type: {submissionType}</Text>
        <Text style={styles.row}>Rider: {riderName}</Text>
        <Text style={styles.row}>Rider ID: {riderId}</Text>
        <Text style={styles.row}>Phone: {riderPhoneNumber || 'N/A'}</Text>
        <Text style={styles.row}>Captured at: {fmt(capturedAt)}</Text>
        <Text style={styles.row}>Submitted at: {fmt(submittedAt)}</Text>
        <Text style={styles.row}>Location: {locationLabel || 'Location unavailable'}</Text>
        <Text style={styles.row}>Description: {description}</Text>
        <Text style={styles.row}>
          Evidence URL:{' '}
          <Link href={evidenceUrl} style={styles.link}>
            Open media
          </Link>
        </Text>
      </Section>
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
  detailsBox: {
    backgroundColor: '#f7f7f7',
    padding: '16px',
    margin: '16px 0',
  },
  row: {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '22px',
    margin: '0 0 8px',
  },
  link: {
    color: '#0f766e',
  },
};

export default ProblemReportNotificationEmail;
