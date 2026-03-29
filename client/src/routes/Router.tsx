import { ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails, TrackOrder } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicOrderPaymentSuccess from '@/pages/public/orders/PublicOrderPaymentSuccess';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage, UnauthorizedPage } from '../pages/common';
import { Login } from '@/pages/auth';
import AuthCallback from '@/pages/auth/AuthCallback';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import CompleteAccount from '@/pages/auth/CompleteAccount';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '@/pages/dashboard';
import { AuthenticatedLayout } from '../containers/navigation/AuthenticatedLayout';
import { OrdersPage } from '@/pages/orders';
import { OrderAssignmentsPage } from '@/pages/order-assignments';
import {
  UsersPage,
  UserProfilePage,
  UserDetailsPage,
  UsersTrackingPage,
  UserLocationHistoryPage,
  RiderManagementPage,
} from '@/pages/users';
import { About, OrderFees } from '@/pages/about';
import { PublicServiceDetailsPage, Services } from '@/pages/services';
import { ContactUsPage } from '@/pages/contact';
import {
  InviteOrganization,
  OrganizationSettingsPage,
  OrganizationsPage,
  ManageOrganizationPage,
} from '@/pages/organizations';
import {
  BusinessPlansPage,
  CreateBusinessPlanPage,
  ManageBusinessPlanPage,
} from '@/pages/business-plans';
import { PaymentsPage } from '@/pages/payments';
import { BillingPaymentsPage, BillingReportPage } from '@/pages/billing';
import {
  OrganizationOnboarding,
  AdminOnboarding,
  UserManagementOnboarding,
  CompleteOnboarding,
} from '@/pages/onboarding';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';
import BatchesPage from '@/pages/batches/BatchesPage';
import BatchDetailsPage from '@/pages/batches/BatchDetailsPage';
import BatchPreviewPage from '@/pages/batches/BatchPreviewPage';
import OrderAssignmentDetails from '@/pages/order-assignments/OrderAssignmentDetails';
import PaymentDetailsPage from '@/pages/payments/PaymentDetailsPage';
import SEO, { SEOProps } from '@/components/seo/SEO';

const allRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'RIDER', 'CUSTOMER'] as const;
const batchRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'CUSTOMER'] as const;
const userManagementRoles = ['ADMIN', 'STAFF', 'BUSINESS'] as const;

const withSEO = (seo: SEOProps, element: ReactElement) => (
  <>
    <SEO {...seo} />
    {element}
  </>
);

const Router = () => {
  return (
    <>
      <Routes>
        {/* ─── Public layout ───────────────────────────────────────────────── */}
        <Route path="/" element={<PublicLayout />}>
          <Route
            index
            element={withSEO(
              {
                title: 'Peekaboo | Smart Delivery & Fleet Management Platform',
                description:
                  'Peekaboo helps businesses manage deliveries, track riders in real time, automate assignments, and optimize fleet operations from one dashboard.',
                keywords:
                  'delivery management, fleet management, logistics software, real-time tracking, route optimization, last-mile delivery',
                path: '/',
              },
              <Home />,
            )}
          />

          <Route path="auth">
            <Route
              path="login"
              element={withSEO(
                {
                  title: 'Login | Peekaboo',
                  description:
                    'Sign in to your Peekaboo account to manage deliveries, teams, and logistics operations in one place.',
                  keywords: 'peekaboo login, delivery platform login, logistics dashboard access',
                  path: '/auth/login',
                },
                <Login />,
              )}
            />
            <Route path="register" element={<Navigate to="/auth/login" replace />} />
            <Route
              path="callback"
              element={withSEO(
                {
                  title: 'Authenticating | Peekaboo',
                  description: 'Securely signing you into Peekaboo.',
                  path: '/auth/callback',
                  noindex: true,
                },
                <AuthCallback />,
              )}
            />
            <Route
              path="forgot-password"
              element={withSEO(
                {
                  title: 'Forgot Password | Peekaboo',
                  description: 'Reset your Peekaboo account password securely.',
                  path: '/auth/forgot-password',
                  noindex: true,
                },
                <ForgotPassword />,
              )}
            />
            <Route
              path="reset-password"
              element={withSEO(
                {
                  title: 'Reset Password | Peekaboo',
                  description: 'Create a new secure password for your Peekaboo account.',
                  path: '/auth/reset-password',
                  noindex: true,
                },
                <ResetPassword />,
              )}
            />
            <Route
              path="complete"
              element={withSEO(
                {
                  title: 'Complete Account Setup | Peekaboo',
                  description: 'Finish setting up your Peekaboo account to start managing operations.',
                  path: '/auth/complete',
                  noindex: true,
                },
                <CompleteAccount />,
              )}
            />
          </Route>

          <Route path="onboarding">
            <Route
              path="organization"
              element={withSEO(
                {
                  title: 'Organization Onboarding | Peekaboo',
                  description: 'Set up your organization profile and delivery workflow in Peekaboo.',
                  path: '/onboarding/organization',
                  noindex: true,
                },
                <OrganizationOnboarding />,
              )}
            />
            <Route
              path="admin"
              element={withSEO(
                {
                  title: 'Admin Onboarding | Peekaboo',
                  description: 'Configure admin access and permissions for your Peekaboo workspace.',
                  path: '/onboarding/admin',
                  noindex: true,
                },
                <AdminOnboarding />,
              )}
            />
            <Route
              path="users"
              element={withSEO(
                {
                  title: 'User Management Onboarding | Peekaboo',
                  description: 'Invite and organize team members during Peekaboo onboarding.',
                  path: '/onboarding/users',
                  noindex: true,
                },
                <UserManagementOnboarding />,
              )}
            />
            <Route
              path="complete"
              element={withSEO(
                {
                  title: 'Onboarding Complete | Peekaboo',
                  description: 'Your Peekaboo onboarding is complete and your workspace is ready.',
                  path: '/onboarding/complete',
                  noindex: true,
                },
                <CompleteOnboarding />,
              )}
            />
          </Route>

          <Route
            path="about"
            element={withSEO(
              {
                title: 'About Peekaboo | Delivery Technology Built for Growth',
                description:
                  'Learn about Peekaboo’s mission to simplify logistics through smarter dispatching, live tracking, and actionable delivery insights.',
                keywords: 'about peekaboo, logistics technology company, delivery software platform',
                path: '/about',
              },
              <About />,
            )}
          />

          <Route
            path="about/orders/fees"
            element={withSEO(
              {
                title: 'Order Fees | Peekaboo',
                description: 'Explore transparent order fee structure and delivery pricing on Peekaboo.',
                keywords: 'delivery fees, order pricing, logistics costs',
                path: '/about/orders/fees',
              },
              <OrderFees />,
            )}
          />

          <Route
            path="services"
            element={withSEO(
              {
                title: 'Services | Peekaboo',
                description:
                  'Discover Peekaboo services including delivery management, rider tracking, route planning, and business analytics.',
                keywords: 'delivery services, fleet services, route planning, logistics analytics',
                path: '/services',
              },
              <Services />,
            )}
          />
          <Route
            path="services/:slug"
            element={withSEO(
              {
                title: 'Service Details | Peekaboo',
                description:
                  'Explore detailed pricing, features, and delivery plan information for Peekaboo business services.',
                keywords: 'business plan details, delivery pricing, dedicated rider plan, logistics pricing',
                path: '/services',
              },
              <PublicServiceDetailsPage />,
            )}
          />

          <Route
            path="contact"
            element={withSEO(
              {
                title: 'Contact Us | Peekaboo',
                description: 'Get in touch with Peekaboo for product support, onboarding, and partnership inquiries.',
                keywords: 'contact peekaboo, logistics support, delivery software help',
                path: '/contact',
              },
              <ContactUsPage />,
            )}
          />
          <Route
            path="track"
            element={withSEO(
              {
                title: 'Track Order | Peekaboo',
                description: 'Track your delivery status in real time with Peekaboo public order tracking.',
                keywords: 'track order, delivery tracking, real-time shipment tracking',
                path: '/track',
              },
              <TrackOrder />,
            )}
          />
        </Route>

        {/* ─── Public order pages (e.g. /p/orders/123) ───────────────────────── */}
        <Route path="/p" element={<PublicLayout />}>
          <Route
            path="orders/:id"
            element={withSEO(
              {
                title: 'Public Order Details | Peekaboo',
                description: 'View public details and current status of your delivery order.',
                path: '/p/orders',
              },
              <PublicOrderDetails />,
            )}
          />
          <Route
            path="orders/:id/payment-success"
            element={withSEO(
              {
                title: 'Payment Successful | Peekaboo',
                description: 'Your order payment has been processed successfully on Peekaboo.',
                path: '/p/orders/payment-success',
                noindex: true,
              },
              <PublicOrderPaymentSuccess />,
            )}
          />
          <Route
            path="orders/:id/tracking"
            element={withSEO(
              {
                title: 'Live Order Tracking | Peekaboo',
                description: 'Follow your order progress and estimated delivery updates in real time.',
                path: '/p/orders/tracking',
              },
              <PublicOrderTracking />,
            )}
          />
        </Route>

        {/* ─── Authenticated (protected) routes ─────────────────────────────── */}
        <Route element={<AuthenticatedLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={[...allRoles]}>
                {withSEO(
                  {
                    title: 'Dashboard | Peekaboo',
                    description: 'Monitor key delivery metrics, fleet activity, and operational performance.',
                    path: '/dashboard',
                    noindex: true,
                  },
                  <Dashboard />,
                )}
              </ProtectedRoute>
            }
          />

          <Route path="orders">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={[...allRoles]}>
                  {withSEO(
                    {
                      title: 'Orders | Peekaboo',
                      description: 'Manage, filter, and track all delivery orders from a single workspace.',
                      path: '/orders',
                      noindex: true,
                    },
                    <OrdersPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={[...allRoles]}>
                  {withSEO(
                    {
                      title: 'Order Tracking | Peekaboo',
                      description: 'View detailed status and location updates for a specific order.',
                      path: '/orders',
                      noindex: true,
                    },
                    <PublicOrderTracking />,
                  )}
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="batches">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={[...batchRoles]}>
                  {withSEO(
                    {
                      title: 'Batches | Peekaboo',
                      description: 'Create and manage batched deliveries for efficient dispatching.',
                      path: '/batches',
                      noindex: true,
                    },
                    <BatchesPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={[...batchRoles]}>
                  {withSEO(
                    {
                      title: 'Batch Details | Peekaboo',
                      description: 'Review orders, riders, and progress for a delivery batch.',
                      path: '/batches',
                      noindex: true,
                    },
                    <BatchDetailsPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/preview"
              element={
                <ProtectedRoute allowedRoles={[...batchRoles]}>
                  {withSEO(
                    {
                      title: 'Batch Preview | Peekaboo',
                      description: 'Preview batch assignment and route details before publishing.',
                      path: '/batches/preview',
                      noindex: true,
                    },
                    <BatchPreviewPage />,
                  )}
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="assignments">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
                  {withSEO(
                    {
                      title: 'Order Assignments | Peekaboo',
                      description: 'Manage rider assignments and monitor assignment progress.',
                      path: '/assignments',
                      noindex: true,
                    },
                    <OrderAssignmentsPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
                  {withSEO(
                    {
                      title: 'Assignment Details | Peekaboo',
                      description: 'View complete information for a specific order assignment.',
                      path: '/assignments',
                      noindex: true,
                    },
                    <OrderAssignmentDetails />,
                  )}
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="users">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={[...userManagementRoles]}>
                  {withSEO(
                    {
                      title: 'Users | Peekaboo',
                      description: 'Manage users, roles, and access permissions across your organization.',
                      path: '/users',
                      noindex: true,
                    },
                    <UsersPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="tracking"
              element={
                <ProtectedRoute allowedRoles={[...userManagementRoles]}>
                  {withSEO(
                    {
                      title: 'User Tracking | Peekaboo',
                      description: 'Track live user and rider locations to improve operations.',
                      path: '/users/tracking',
                      noindex: true,
                    },
                    <UsersTrackingPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/location-history"
              element={
                <ProtectedRoute allowedRoles={[...userManagementRoles]}>
                  {withSEO(
                    {
                      title: 'User Location History | Peekaboo',
                      description: 'Review historical movement and location records for a user.',
                      path: '/users/location-history',
                      noindex: true,
                    },
                    <UserLocationHistoryPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={[...userManagementRoles]}>
                  {withSEO(
                    {
                      title: 'User Details | Peekaboo',
                      description: 'View profile, role, and operational details of a team member.',
                      path: '/users',
                      noindex: true,
                    },
                    <UserDetailsPage />,
                  )}
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="rider-management"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                {withSEO(
                  {
                    title: 'Rider Management | Peekaboo',
                    description:
                      'Admin dashboard for rider deliveries, earnings, reliability, and activity ranking.',
                    path: '/rider-management',
                    noindex: true,
                  },
                  <RiderManagementPage />,
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="user-profile"
            element={
              <ProtectedRoute allowedRoles={[...allRoles]}>
                {withSEO(
                  {
                    title: 'My Profile | Peekaboo',
                    description: 'Update personal details, preferences, and account settings.',
                    path: '/user-profile',
                    noindex: true,
                  },
                  <UserProfilePage />,
                )}
              </ProtectedRoute>
            }
          />

          <Route path="payments">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Payments | Peekaboo',
                      description: 'Track transactions, payment statuses, and financial records.',
                      path: '/payments',
                      noindex: true,
                    },
                    <PaymentsPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={withSEO(
                {
                  title: 'Payment Details | Peekaboo',
                  description: 'View complete payment details for a selected transaction.',
                  path: '/payments',
                  noindex: true,
                },
                <PaymentDetailsPage />,
              )}
            />
          </Route>

          <Route
            path="billing-payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BUSINESS']}>
                {withSEO(
                  {
                    title: 'Billing & Payments | Peekaboo',
                    description: 'Track delivery billings, payment status, and organization plan costs.',
                    path: '/billing-payments',
                    noindex: true,
                  },
                  <BillingPaymentsPage />,
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="billing-payments/report"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BUSINESS']}>
                {withSEO(
                  {
                    title: 'Billing Report | Peekaboo',
                    description:
                      'Generate and send business billing and delivery reports.',
                    path: '/billing-payments/report',
                    noindex: true,
                  },
                  <BillingReportPage />,
                )}
              </ProtectedRoute>
            }
          />

          <Route path="organizations">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Organizations | Peekaboo',
                      description: 'Manage client organizations and workspace configurations.',
                      path: '/organizations',
                      noindex: true,
                    },
                    <OrganizationsPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/manage"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Manage Organization | Peekaboo',
                      description: 'Update organization details, billing, and operational settings.',
                      path: '/organizations/manage',
                      noindex: true,
                    },
                    <ManageOrganizationPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="invite"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Invite Organization | Peekaboo',
                      description: 'Invite a new organization to your Peekaboo platform instance.',
                      path: '/organizations/invite',
                      noindex: true,
                    },
                    <InviteOrganization />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS']}>
                  {withSEO(
                    {
                      title: 'Organization Settings | Peekaboo',
                      description: 'Configure organization-level preferences and profile settings.',
                      path: '/organizations/settings',
                      noindex: true,
                    },
                    <OrganizationSettingsPage />,
                  )}
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="business-plans">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Business Plans | Peekaboo',
                      description: 'Manage subscription plans, features, and pricing models.',
                      path: '/business-plans',
                      noindex: true,
                    },
                    <BusinessPlansPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Create Business Plan | Peekaboo',
                      description: 'Create a new business plan with custom pricing and capabilities.',
                      path: '/business-plans/create',
                      noindex: true,
                    },
                    <CreateBusinessPlanPage />,
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/manage"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  {withSEO(
                    {
                      title: 'Manage Business Plan | Peekaboo',
                      description: 'Edit and optimize an existing business plan configuration.',
                      path: '/business-plans/manage',
                      noindex: true,
                    },
                    <ManageBusinessPlanPage />,
                  )}
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* ─── Standalone pages ─────────────────────────────────────────────── */}
        <Route
          path="/unauthorized"
          element={withSEO(
            {
              title: 'Unauthorized Access | Peekaboo',
              description: 'You do not have permission to access this page.',
              path: '/unauthorized',
              noindex: true,
            },
            <UnauthorizedPage />,
          )}
        />
        <Route
          path="*"
          element={withSEO(
            {
              title: 'Page Not Found | Peekaboo',
              description: 'The page you are looking for does not exist or has been moved.',
              noindex: true,
            },
            <NotFoundPage />,
          )}
        />
      </Routes>
      <SessionExpiredModal />
    </>
  );
};

export default Router;
