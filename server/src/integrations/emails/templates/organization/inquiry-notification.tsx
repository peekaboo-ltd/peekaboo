import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
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
      <Text style={emailStyles.heading}>New business inquiry</Text>
      <Text style={emailStyles.text}>
        A new business inquiry has been submitted from the landing page.
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Company name: {companyName}
        </Text>
        <Text style={emailStyles.detailRow}>
          Contact name: {contactName}
        </Text>
        <Text style={emailStyles.detailRow}>
          Email: {contactEmail}
        </Text>
        <Text style={emailStyles.detailRow}>
          Phone: {phoneNumber || 'Not provided'}
        </Text>
        {message && (
          <Text style={emailStyles.detailRow}>
            Message: {message}
          </Text>
        )}
      </Section>
      <Text style={emailStyles.text}>
        Please follow up with this inquiry as soon as possible.
      </Text>
    </EmailLayout>
  );
};

export default InquiryNotificationEmail;
