import { Resend } from 'resend';
import { render } from '@react-email/render';
import logger from '../../helpers/logger.helper';

// Templates
import { WelcomeEmail } from './templates/auth/welcome';
import { PasswordResetEmail } from './templates/auth/password-reset';
import { PasswordChangedEmail } from './templates/auth/password-changed';
import { OAuthWelcomeEmail } from './templates/auth/oauth-welcome';
import { OnboardingInviteEmail } from './templates/organization/onboarding-invite';
import { OnboardingCompleteEmail } from './templates/organization/onboarding-complete';
import { InquiryNotificationEmail } from './templates/organization/inquiry-notification';
import { MemberAddedEmail } from './templates/organization/member-added';
import { MemberRoleChangedEmail } from './templates/organization/member-role-changed';
import { MemberRemovedEmail } from './templates/organization/member-removed';
import { OrgStatusChangedEmail } from './templates/organization/org-status-changed';
import { InvoiceGeneratedEmail } from './templates/billing/invoice-generated';
import { BillingPaymentReceivedEmail } from './templates/billing/payment-received';
import { PaymentOverdueEmail as BillingPaymentOverdueEmail } from './templates/billing/payment-overdue';
import { MonthlyBillingSummaryEmail } from './templates/billing/monthly-summary';
import { PaymentInitiatedEmail } from './templates/payment/payment-initiated';
import { PaymentSuccessfulEmail } from './templates/payment/payment-successful';
import { PaymentFailedEmail } from './templates/payment/payment-failed';
import { OrderCreatedSenderEmail } from './templates/order/order-created-sender';
import { OrderCreatedRecipientEmail } from './templates/order/order-created-recipient';
import { OrderStatusEmail } from './templates/order/order-status';
import { RiderAssignedEmail } from './templates/assignment/rider-assigned';
import { AssignmentNotificationEmail } from './templates/assignment/assignment-notification';
import { AssignmentStatusEmail } from './templates/assignment/assignment-status';
import { NewOrganizationEmail } from './templates/admin/new-organization';
import { DailySummaryEmail } from './templates/admin/daily-summary';
import { CriticalAlertEmail } from './templates/admin/critical-alert';
import { AccountStatusEmail } from './templates/user/account-status';

// Types
import {
  WelcomeEmailData,
  PasswordResetEmailData,
  PasswordChangedEmailData,
  OAuthWelcomeEmailData,
  OnboardingInviteEmailData,
  OnboardingCompleteEmailData,
  OrganizationInquiryEmailData,
  MemberAddedEmailData,
  MemberRoleChangedEmailData,
  MemberRemovedEmailData,
  OrganizationStatusEmailData,
  InvoiceGeneratedEmailData,
  PaymentReceivedEmailData,
  PaymentOverdueEmailData,
  MonthlyBillingSummaryEmailData,
  PaymentInitiatedEmailData,
  PaymentSuccessfulEmailData,
  PaymentFailedEmailData,
  OrderCreatedSenderEmailData,
  OrderCreatedRecipientEmailData,
  OrderStatusEmailData,
  RiderAssignedEmailData,
  AssignmentNotificationEmailData,
  AssignmentStatusEmailData,
  NewOrganizationAdminEmailData,
  DailySummaryEmailData,
  CriticalAlertEmailData,
  AccountStatusEmailData,
} from './types/email.types';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private adminEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_EMAIL || 'noreply@peekaboo.co.rw';
    this.adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || 'info@peekaboo.co.rw';
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${subject}`, error);
    }
  }

  // ==================== AUTH EMAILS ====================

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const data: WelcomeEmailData = {
      name,
      email: to,
      loginUrl: `${baseUrl}/auth/login`,
    };
    const html = await render(WelcomeEmail(data));
    await this.sendEmail({
      to,
      subject: 'Welcome to Peekaboo!',
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    tempPassword: string
  ): Promise<void> {
    const data: PasswordResetEmailData = {
      name: '',
      email: to,
      temporaryPassword: tempPassword,
    };
    const html = await render(PasswordResetEmail(data));
    await this.sendEmail({
      to,
      subject: 'Password Reset - Peekaboo',
      html,
    });
  }

  async sendPasswordChangedEmail(
    data: PasswordChangedEmailData
  ): Promise<void> {
    const html = await render(PasswordChangedEmail(data));
    await this.sendEmail({
      to: data.email,
      subject: 'Password Changed - Peekaboo',
      html,
    });
  }

  async sendOAuthWelcomeEmail(data: OAuthWelcomeEmailData): Promise<void> {
    const html = await render(OAuthWelcomeEmail(data));
    await this.sendEmail({
      to: data.email,
      subject: `Welcome to Peekaboo! (via ${data.provider})`,
      html,
    });
  }

  // ==================== ORGANIZATION EMAILS ====================

  async sendOnboardingInviteEmail(data: OnboardingInviteEmailData): Promise<void> {
    const html = await render(OnboardingInviteEmail(data));
    await this.sendEmail({
      to: data.to,
      subject: `Complete your Peekaboo account setup - ${data.organizationName}`,
      html,
    });
  }

  async sendOnboardingCompleteEmail(
    data: OnboardingCompleteEmailData
  ): Promise<void> {
    const html = await render(OnboardingCompleteEmail(data));
    await this.sendEmail({
      to: data.to,
      subject: `Your Peekaboo account is active - ${data.organizationName}`,
      html,
    });
  }

  async sendOrganizationInquiryNotification(
    data: OrganizationInquiryEmailData
  ): Promise<void> {
    const html = await render(InquiryNotificationEmail(data));
    await this.sendEmail({
      to: this.adminEmail,
      subject: `New Business Inquiry: ${data.companyName}`,
      html,
    });
  }

  async sendMemberAddedEmail(data: MemberAddedEmailData): Promise<void> {
    const html = await render(MemberAddedEmail(data));
    await this.sendEmail({
      to: data.memberEmail,
      subject: `You've been added to ${data.organizationName} - Peekaboo`,
      html,
    });
  }

  async sendMemberRoleChangedEmail(
    data: MemberRoleChangedEmailData
  ): Promise<void> {
    const html = await render(MemberRoleChangedEmail(data));
    await this.sendEmail({
      to: data?.memberEmail,
      subject: `Your role in ${data?.organizationName} has been updated - Peekaboo`,
      html,
    });
  }

  async sendMemberRemovedEmail(data: MemberRemovedEmailData): Promise<void> {
    const html = await render(MemberRemovedEmail(data));
    await this.sendEmail({
      to: data?.memberEmail,
      subject: `You've been removed from ${data?.organizationName} - Peekaboo`,
      html,
    });
  }

  async sendOrganizationStatusEmail(
    data: OrganizationStatusEmailData
  ): Promise<void> {
    const html = await render(OrgStatusChangedEmail(data));
    await this.sendEmail({
      to: data?.adminEmail,
      subject: `Organization ${data?.status === 'ACTIVE' ? 'Activated' : 'Suspended'}: ${data?.organizationName} - Peekaboo`,
      html,
    });
  }

  // ==================== BILLING EMAILS ====================

  async sendInvoiceGeneratedEmail(
    data: InvoiceGeneratedEmailData
  ): Promise<void> {
    const html = await render(InvoiceGeneratedEmail(data));
    await this.sendEmail({
      to: data?.adminEmail,
      subject: `Invoice ${data?.invoiceNumber} generated - ${data?.organizationName}`,
      html,
    });
  }

  async sendBillingPaymentReceivedEmail(
    data: PaymentReceivedEmailData
  ): Promise<void> {
    const html = await render(BillingPaymentReceivedEmail(data));
    await this.sendEmail({
      to: data?.adminEmail,
      subject: `Payment received for invoice ${data.invoiceNumber} - ${data.organizationName}`,
      html,
    });
  }

  async sendPaymentOverdueEmail(data: PaymentOverdueEmailData): Promise<void> {
    const html = await render(BillingPaymentOverdueEmail(data));
    await this.sendEmail({
      to: data?.adminEmail,
      subject: `Payment overdue: Invoice ${data?.invoiceNumber} - ${data?.organizationName}`,
      html,
    });
  }

  async sendMonthlyBillingSummaryEmail(
    data: MonthlyBillingSummaryEmailData
  ): Promise<void> {
    const html = await render(MonthlyBillingSummaryEmail(data));
    await this.sendEmail({
      to: data?.adminEmail,
      subject: `Monthly billing summary: ${data?.month} ${data?.year} - ${data?.organizationName}`,
      html,
    });
  }

  // ==================== PAYMENT EMAILS ====================

  async sendPaymentInitiatedEmail(
    data: PaymentInitiatedEmailData
  ): Promise<void> {
    const html = await render(PaymentInitiatedEmail(data));
    await this.sendEmail({
      to: data?.customerEmail,
      subject: `Payment initiated for order ${data?.orderReference} - Peekaboo`,
      html,
    });
  }

  async sendPaymentSuccessfulEmail(
    data: PaymentSuccessfulEmailData
  ): Promise<void> {
    const html = await render(PaymentSuccessfulEmail(data));
    await this.sendEmail({
      to: data?.customerEmail,
      subject: `Payment confirmed for order ${data?.orderReference} - Peekaboo`,
      html,
    });
  }

  async sendPaymentFailedEmail(data: PaymentFailedEmailData): Promise<void> {
    const html = await render(PaymentFailedEmail(data));
    await this.sendEmail({
      to: data?.customerEmail,
      subject: `Payment failed for order ${data?.orderReference} - Peekaboo`,
      html,
    });
  }

  // ==================== ORDER EMAILS ====================

  async sendOrderCreatedSenderEmail(
    data: OrderCreatedSenderEmailData
  ): Promise<void> {
    const html = await render(OrderCreatedSenderEmail(data));
    await this.sendEmail({
      to: data.senderEmail,
      subject: `Order ${data.orderReference} created - Peekaboo`,
      html,
    });
  }

  async sendOrderCreatedRecipientEmail(
    data: OrderCreatedRecipientEmailData
  ): Promise<void> {
    const html = await render(OrderCreatedRecipientEmail(data));
    await this.sendEmail({
      to: data.recipientEmail,
      subject: `You have a delivery coming! Order ${data?.orderReference} - Peekaboo`,
      html,
    });
  }

  async sendOrderStatusEmail(data: OrderStatusEmailData): Promise<void> {
    const html = await render(OrderStatusEmail(data));
    await this.sendEmail({
      to: data.userEmail,
      subject: `Order ${data?.orderReference} - ${data?.status} - Peekaboo`,
      html,
    });
  }

  // ==================== ASSIGNMENT EMAILS ====================

  async sendRiderAssignedEmail(data: RiderAssignedEmailData): Promise<void> {
    const html = await render(RiderAssignedEmail(data));
    await this.sendEmail({
      to: data.riderEmail,
      subject: `New delivery assignment: Order ${data.orderReference} - Peekaboo`,
      html,
    });
  }

  async sendAssignmentNotificationEmail(
    data: AssignmentNotificationEmailData
  ): Promise<void> {
    const html = await render(AssignmentNotificationEmail(data));
    await this.sendEmail({
      to: data.userEmail,
      subject: `Rider assigned to order ${data.orderReference} - Peekaboo`,
      html,
    });
  }

  async sendAssignmentStatusEmail(
    data: AssignmentStatusEmailData
  ): Promise<void> {
    const html = await render(AssignmentStatusEmail(data));
    await this.sendEmail({
      to: data.userEmail,
      subject: `Assignment ${data.status} for order ${data.orderReference} - Peekaboo`,
      html,
    });
  }

  // ==================== ADMIN EMAILS ====================

  async sendNewOrganizationAdminEmail(
    data: NewOrganizationAdminEmailData
  ): Promise<void> {
    const html = await render(NewOrganizationEmail(data));
    await this.sendEmail({
      to: this.adminEmail,
      subject: `New organization registered: ${data.organizationName}`,
      html,
    });
  }

  async sendDailySummaryEmail(data: DailySummaryEmailData): Promise<void> {
    const html = await render(DailySummaryEmail(data));
    await this.sendEmail({
      to: this.adminEmail,
      subject: `Peekaboo Daily Summary - ${new Date(data.date).toLocaleDateString()}`,
      html,
    });
  }

  async sendCriticalAlertEmail(data: CriticalAlertEmailData): Promise<void> {
    const html = await render(CriticalAlertEmail(data));
    await this.sendEmail({
      to: this.adminEmail,
      subject: `[CRITICAL] ${data.alertType} - Peekaboo`,
      html,
    });
  }

  // ==================== USER ACCOUNT EMAILS ====================

  async sendAccountStatusEmail(data: AccountStatusEmailData): Promise<void> {
    const html = await render(AccountStatusEmail(data));
    await this.sendEmail({
      to: data.email,
      subject: `Account ${data.status} - Peekaboo`,
      html,
    });
  }

  // ==================== LEGACY COMPATIBILITY ====================

  async sendOrderConfirmationEmail(
    to: string,
    orderId: string
  ): Promise<void> {
    await this.sendOrderStatusEmail({
      userName: '',
      userEmail: to,
      orderReference: orderId,
      status: 'CONFIRMED',
      statusMessage: 'Your order has been confirmed.',
    });
  }

  async sendPaymentReceiptEmail(
    to: string,
    paymentId: string
  ): Promise<void> {
    await this.sendPaymentSuccessfulEmail({
      customerName: '',
      customerEmail: to,
      orderReference: paymentId,
      amount: 0,
      currency: 'RWF',
      transactionId: paymentId,
    });
  }
}
