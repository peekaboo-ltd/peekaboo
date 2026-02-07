import logger from '../../helpers/logger.helper';

export class EmailService {
  async sendPasswordResetEmail(
    to: string,
    tempPassword: string
  ): Promise<void> {
    // In a real implementation, you would use a service like SendGrid, AWS SES, etc.
    // For now, we'll just log the password reset
    logger.info(`Password reset email sent to ${to}`);
    logger.info(`Temporary password: ${tempPassword}`);

    // TODO: Implement actual email sending
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: 'noreply@peekaboo.com',
    //   to,
    //   subject: 'Password Reset - Peekaboo',
    //   html: `Your temporary password is: ${tempPassword}`
    // });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    logger.info(`Welcome email sent to ${to}`);
    // TODO: Implement actual email sending
  }

  async sendOrderConfirmationEmail(to: string, orderId: string): Promise<void> {
    logger.info(`Order confirmation email sent to ${to} for order ${orderId}`);
    // TODO: Implement actual email sending
  }

  async sendPaymentReceiptEmail(to: string, paymentId: string): Promise<void> {
    logger.info(`Payment receipt email sent to ${to} for payment ${paymentId}`);
    // TODO: Implement actual email sending
  }

  /**
   * Send notification to admin when an organization submits a contact inquiry
   */
  async sendOrganizationInquiryNotification(data: {
    contactName: string;
    contactEmail: string;
    companyName: string;
    phoneNumber?: string;
    message?: string;
  }): Promise<void> {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@peekaboo.rw';
    logger.info(
      `[ORG INQUIRY] New inquiry from ${data.companyName} (${data.contactEmail})`
    );
    logger.info(
      `[ORG INQUIRY] Contact: ${data.contactName}, Phone: ${data.phoneNumber || 'N/A'}`
    );
    logger.info(`[ORG INQUIRY] Message: ${data.message || 'N/A'}`);
    logger.info(`[ORG INQUIRY] Admin notification would be sent to: ${adminEmail}`);

    // TODO: Implement with SendGrid/AWS SES
    // await transporter.sendMail({
    //   from: 'noreply@peekaboo.rw',
    //   to: adminEmail,
    //   subject: `New Business Inquiry: ${data.companyName}`,
    //   html: `...`
    // });
  }

  /**
   * Send onboarding invite email to an organization's admin
   */
  async sendOnboardingInviteEmail(data: {
    to: string;
    organizationName: string;
    adminName: string;
    inviteToken: string;
  }): Promise<void> {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl}/onboarding/complete?token=${data.inviteToken}`;

    logger.info(
      `[ORG INVITE] Onboarding invite sent to ${data.to} for org "${data.organizationName}"`
    );
    logger.info(`[ORG INVITE] Invite link: ${inviteLink}`);

    // TODO: Implement with SendGrid/AWS SES
    // await transporter.sendMail({
    //   from: 'noreply@peekaboo.rw',
    //   to: data.to,
    //   subject: `Complete your Peekaboo account setup - ${data.organizationName}`,
    //   html: `...`
    // });
  }

  /**
   * Send confirmation email when organization onboarding is completed
   */
  async sendOnboardingCompleteEmail(data: {
    to: string;
    organizationName: string;
    adminName: string;
  }): Promise<void> {
    logger.info(
      `[ORG COMPLETE] Onboarding complete email sent to ${data.to} for org "${data.organizationName}"`
    );

    // TODO: Implement with SendGrid/AWS SES
    // const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // await transporter.sendMail({
    //   from: 'noreply@peekaboo.rw',
    //   to: data.to,
    //   subject: `Your Peekaboo account is active - ${data.organizationName}`,
    //   html: `...`
    // });
  }
}
