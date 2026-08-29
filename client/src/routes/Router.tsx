import { ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails, TrackOrder } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicOrderPaymentSuccess from '@/pages/public/orders/PublicOrderPaymentSuccess';
import PublicOrderPaymentPending from '@/pages/public/orders/PublicOrderPaymentPending';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage, UnauthorizedPage } from '../pages/common';
import { Login, RegisterPage } from '@/pages/auth';
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
  LegalPage,
  TermsAndConditionsPage,
  RefundPolicyPage,
  CancellationPolicyPage,
} from '@/pages/legal';
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
import LocalizedSEO from '@/components/seo/LocalizedSEO';

const allRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'RIDER', 'CUSTOMER'] as const;
const batchRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'CUSTOMER'] as const;
const userManagementRoles = ['ADMIN', 'STAFF', 'BUSINESS'] as const;

type LocalizedSEOConfig = {
  seoKey: string;
  path?: string;
  noindex?: boolean;
  keywords?: string;
};

const withLocalizedSEO = (config: LocalizedSEOConfig, element: ReactElement) => (
  <>
    <LocalizedSEO
      seoKey={config.seoKey}
      path={config.path}
      noindex={config.noindex}
      keywords={config.keywords}
    />
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
            element={withLocalizedSEO(
              {
                seoKey: 'home',
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
              element={withLocalizedSEO(
                {
                  seoKey: 'authLogin',
                  keywords: 'peekaboo login, delivery platform login, logistics dashboard access',
                  path: '/auth/login',
                },
                <Login />,
              )}
            />
            <Route
              path="register"
              element={withLocalizedSEO(
                {
                  seoKey: 'authRegister',
                  keywords: 'peekaboo signup, delivery account, logistics platform signup',
                  path: '/auth/register',
                },
                <RegisterPage />,
              )}
            />
            <Route
              path="callback"
              element={withLocalizedSEO(
                {
                  seoKey: 'authCallback',
                  path: '/auth/callback',
                  noindex: true,
                },
                <AuthCallback />,
              )}
            />
            <Route
              path="forgot-password"
              element={withLocalizedSEO(
                {
                  seoKey: 'authForgot',
                  path: '/auth/forgot-password',
                  noindex: true,
                },
                <ForgotPassword />,
              )}
            />
            <Route
              path="reset-password"
              element={withLocalizedSEO(
                {
                  seoKey: 'authReset',
                  path: '/auth/reset-password',
                  noindex: true,
                },
                <ResetPassword />,
              )}
            />
            <Route
              path="complete"
              element={withLocalizedSEO(
                {
                  seoKey: 'authComplete',
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
              element={withLocalizedSEO(
                {
                  seoKey: 'onboardingOrganization',
                  path: '/onboarding/organization',
                  noindex: true,
                },
                <OrganizationOnboarding />,
              )}
            />
            <Route
              path="admin"
              element={withLocalizedSEO(
                {
                  seoKey: 'onboardingAdmin',
                  path: '/onboarding/admin',
                  noindex: true,
                },
                <AdminOnboarding />,
              )}
            />
            <Route
              path="users"
              element={withLocalizedSEO(
                {
                  seoKey: 'onboardingUsers',
                  path: '/onboarding/users',
                  noindex: true,
                },
                <UserManagementOnboarding />,
              )}
            />
            <Route
              path="complete"
              element={withLocalizedSEO(
                {
                  seoKey: 'onboardingComplete',
                  path: '/onboarding/complete',
                  noindex: true,
                },
                <CompleteOnboarding />,
              )}
            />
          </Route>

          <Route
            path="about"
            element={withLocalizedSEO(
              {
                seoKey: 'about',
                keywords: 'about peekaboo, logistics technology company, delivery software platform',
                path: '/about',
              },
              <About />,
            )}
          />

          <Route
            path="about/orders/fees"
            element={withLocalizedSEO(
              {
                seoKey: 'orderFees',
                keywords: 'delivery fees, order pricing, logistics costs',
                path: '/about/orders/fees',
              },
              <OrderFees />,
            )}
          />

          <Route
            path="services"
            element={withLocalizedSEO(
              {
                seoKey: 'services',
                keywords: 'delivery services, fleet services, route planning, logistics analytics',
                path: '/services',
              },
              <Services />,
            )}
          />
          <Route
            path="services/:slug"
            element={withLocalizedSEO(
              {
                seoKey: 'serviceDetails',
                keywords: 'business plan details, delivery pricing, dedicated rider plan, logistics pricing',
                path: '/services',
              },
              <PublicServiceDetailsPage />,
            )}
          />

          <Route
            path="contact"
            element={withLocalizedSEO(
              {
                seoKey: 'contact',
                keywords: 'contact peekaboo, logistics support, delivery software help',
                path: '/contact',
              },
              <ContactUsPage />,
            )}
          />

          <Route
            path="legal"
            element={withLocalizedSEO(
              {
                seoKey: 'legalHub',
                keywords: 'peekaboo legal, terms of service, refund policy, cancellation policy',
                path: '/legal',
              },
              <LegalPage />,
            )}
          />
          <Route
            path="legal/terms-and-conditions"
            element={withLocalizedSEO(
              {
                seoKey: 'legalTerms',
                keywords: 'peekaboo terms, terms of service, delivery platform terms',
                path: '/legal/terms-and-conditions',
              },
              <TermsAndConditionsPage />,
            )}
          />
          <Route
            path="legal/refund-policy"
            element={withLocalizedSEO(
              {
                seoKey: 'legalRefund',
                keywords: 'peekaboo refunds, delivery refund policy',
                path: '/legal/refund-policy',
              },
              <RefundPolicyPage />,
            )}
          />
          <Route
            path="legal/cancellation-policy"
            element={withLocalizedSEO(
              {
                seoKey: 'legalCancellation',
                keywords: 'peekaboo cancellation, order cancellation policy',
                path: '/legal/cancellation-policy',
              },
              <CancellationPolicyPage />,
            )}
          />

          <Route
            path="track"
            element={withLocalizedSEO(
              {
                seoKey: 'track',
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
            element={withLocalizedSEO(
              {
                seoKey: 'publicOrder',
                path: '/p/orders',
              },
              <PublicOrderDetails />,
            )}
          />
          <Route
            path="orders/:id/payment-pending"
            element={withLocalizedSEO(
              {
                seoKey: 'paymentPending',
                path: '/p/orders/payment-pending',
                noindex: true,
              },
              <PublicOrderPaymentPending />,
            )}
          />
          <Route
            path="orders/:id/payment-success"
            element={withLocalizedSEO(
              {
                seoKey: 'paymentSuccess',
                path: '/p/orders/payment-success',
                noindex: true,
              },
              <PublicOrderPaymentSuccess />,
            )}
          />
          <Route
            path="orders/:id/tracking"
            element={withLocalizedSEO(
              {
                seoKey: 'orderTracking',
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
                {withLocalizedSEO(
                  {
                    seoKey: 'dashboard',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'orders',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'orderDetail',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'batches',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'batchDetail',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'batchPreview',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'assignments',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'assignmentDetail',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'users',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'usersTracking',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'userLocationHistory',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'userDetail',
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
                {withLocalizedSEO(
                  {
                    seoKey: 'riderManagement',
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
                {withLocalizedSEO(
                  {
                    seoKey: 'userProfile',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'payments',
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
              element={withLocalizedSEO(
                {
                  seoKey: 'paymentDetail',
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
                {withLocalizedSEO(
                  {
                    seoKey: 'billingPayments',
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
                {withLocalizedSEO(
                  {
                    seoKey: 'billingReport',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'organizations',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'organizationManage',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'organizationInvite',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'organizationSettings',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'businessPlans',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'businessPlanCreate',
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
                  {withLocalizedSEO(
                    {
                      seoKey: 'businessPlanManage',
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
          element={withLocalizedSEO(
            {
              seoKey: 'unauthorized',
              path: '/unauthorized',
              noindex: true,
            },
            <UnauthorizedPage />,
          )}
        />
        <Route
          path="*"
          element={withLocalizedSEO(
            {
              seoKey: 'notFound',
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
