import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { OrganizationInquiryEmailData } from '../../types/email.types';

export const InquiryNotificationEmail = ({
  contactName,
  contactEmail,
  companyName,
  phoneNumber,
  message,
}: OrganizationInquiryEmailData) => {
  return (
    <EmailLayout preview={`New Business Inquiry from ${companyName}`}>
      <Text style={styles.heading}>New Business Inquiry</Text>
      <Text style={styles.text}>
        A new business inquiry has been submitted from the landing page.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          Company Name: {companyName}
        </Text>
        <Text style={styles.detailRow}>
          Contact Name: {contactName}
        </Text>
        <Text style={styles.detailRow}>
          Email: {contactEmail}
        </Text>
        <Text style={styles.detailRow}>
          Phone: {phoneNumber || 'Not provided'}
        </Text>
        {message && (
          <Text style={styles.detailRow}>
            Message: {message}
          </Text>
        )}
      </Section>
      <Text style={styles.text}>
        Please follow up with this inquiry as soon as possible.
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
  detailsBox: {
    backgroundColor: '#f7f7f7',
    padding: '16px',
    margin: '16px 0',
  },
  detailRow: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '4px 0',
  },
};

export default InquiryNotificationEmail;
