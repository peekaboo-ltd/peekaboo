// ==================== AUTH EMAILS ====================

export interface WelcomeEmailData {
  name: string;
  email: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  name: string;
  email: string;
  temporaryPassword: string;
}

export interface PasswordChangedEmailData {
  name: string;
  email: string;
}

export interface OAuthWelcomeEmailData {
  name: string;
  email: string;
  provider: string;
  dashboardUrl: string;
}

// ==================== ORGANIZATION EMAILS ====================

export interface OnboardingInviteEmailData {
  to: string;
  organizationName: string;
  adminName: string;
  inviteToken: string;
}

export interface OnboardingCompleteEmailData {
  to: string;
  organizationName: string;
  adminName: string;
}

export interface OrganizationInquiryEmailData {
  contactName: string;
  contactEmail: string;
  companyName: string;
  phoneNumber?: string;
  message?: string;
}

export interface MemberInvitationEmailData {
  organizationName: string;
  inviterName: string;
  inviteeName: string;
  inviteeEmail: string;
  role: string;
}

export interface MemberAddedEmailData {
  organizationName: string;
  memberName: string;
  memberEmail: string;
  role: string;
}

export interface MemberRoleChangedEmailData {
  organizationName: string;
  memberName: string;
  memberEmail: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
}

export interface MemberRemovedEmailData {
  organizationName: string;
  memberName: string;
  memberEmail: string;
}

export interface OrganizationStatusEmailData {
  organizationName: string;
  adminName: string;
  adminEmail: string;
  status: string;
  reason?: string;
}

// ==================== BILLING EMAILS ====================

export interface InvoiceGeneratedEmailData {
  organizationName: string;
  adminEmail: string;
  invoiceNumber: string;
  periodStart: Date;
  periodEnd: Date;
  totalAmount: number;
  currency: string;
  totalOrders: number;
}

export interface PaymentReceivedEmailData {
  organizationName: string;
  adminEmail: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentDate: Date;
}

export interface PaymentOverdueEmailData {
  organizationName: string;
  adminEmail: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: Date;
  daysOverdue: number;
}

export interface MonthlyBillingSummaryEmailData {
  organizationName: string;
  adminEmail: string;
  month: string;
  year: number;
  totalOrders: number;
  totalAmount: number;
  currency: string;
}

// ==================== PAYMENT EMAILS ====================

export interface PaymentInitiatedEmailData {
  customerName: string;
  customerEmail: string;
  orderReference: string;
  amount: number;
  currency: string;
}

export interface PaymentSuccessfulEmailData {
  customerName: string;
  customerEmail: string;
  orderReference: string;
  amount: number;
  currency: string;
  transactionId: string;
}

export interface PaymentFailedEmailData {
  customerName: string;
  customerEmail: string;
  orderReference: string;
  amount: number;
  currency: string;
}

// ==================== ORDER EMAILS ====================

export interface OrderCreatedSenderEmailData {
  senderName: string;
  senderEmail: string;
  recipientPhone: string;
  orderReference: string;
  fee: number;
  currency: string;
}

export interface OrderCreatedRecipientEmailData {
  recipientName: string;
  recipientEmail: string;
  senderPhone: string;
  orderReference: string;
}

export interface OrderStatusEmailData {
  userName: string;
  userEmail: string;
  orderReference: string;
  status: string;
  statusMessage: string;
  trackingInfo?: {
    riderName?: string;
    riderPhone?: string;
  };
}

// ==================== ASSIGNMENT EMAILS ====================

export interface RiderAssignedEmailData {
  riderName: string;
  riderEmail: string;
  orderReference: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  senderPhone?: string;
  recipientPhone?: string;
}

export interface AssignmentNotificationEmailData {
  userName: string;
  userEmail: string;
  orderReference: string;
  riderName: string;
  riderPhone?: string;
}

export interface AssignmentStatusEmailData {
  userName: string;
  userEmail: string;
  orderReference: string;
  riderName: string;
  status: 'accepted' | 'rejected';
}

// ==================== ADMIN EMAILS ====================

export interface NewOrganizationAdminEmailData {
  organizationName: string;
  adminName: string;
  email: string;
  phoneNumber?: string;
  createdAt: Date;
}

export interface HighValueOrderEmailData {
  orderReference: string;
  amount: number;
  currency: string;
  organizationName?: string;
  createdAt: Date;
}

export interface DailySummaryEmailData {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  newOrganizations: number;
  activeRiders: number;
  pendingPayments: number;
}

export interface CriticalAlertEmailData {
  alertType: string;
  message: string;
  details?: string;
  timestamp: Date;
}

// ==================== USER ACCOUNT EMAILS ====================

export interface AccountStatusEmailData {
  name: string;
  email: string;
  status: 'suspended' | 'reactivated' | 'deleted';
  reason?: string;
}
