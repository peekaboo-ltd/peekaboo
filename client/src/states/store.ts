import { configureStore } from '@reduxjs/toolkit';
import { ordersMutationApiSlice } from '../api/mutations/orders.mutations';
import orderSlice from './slices/order.slice';
import { ordersQueriesApiSlice } from '../api/queries/orders.queries';
import { externalMutationsApiSlice } from '../api/mutations/external.mutations';
import { orderAssignmentsMutationsApiSlice } from '../api/mutations/orderAssignments.mutations';
import { orderAssignmentQueriesApiSlice } from '../api/queries/orderAssignment.queries';
import orderAssignmentSlice from './slices/orderAssignment.slice';
import orderActivitySlice from './slices/orderActivity.slice';
import { orderActivityQueriesApiSlice } from '../api/queries/orderActivity.queries';
import authSlice from './slices/auth.slice';
import { authMutationApiSlice } from '../api/mutations/auth.mutations';
import sidebarSlice from './slices/sidebar.slice';
import { paymentsQueriesApiSlice } from '../api/queries/payments.queries';
import paymentSlice from './slices/payment.slice';
import { paymentsMutationsApiSlice } from '../api/mutations/payments.mutations';
import { usersQueriesApiSlice } from '../api/queries/users.queries';
import { usersMutationsApiSlice } from '../api/mutations/users.mutations';
import userSlice from './slices/user.slice';
import { dashboardQueriesApiSlice } from '../api/queries/dashboard.queries';
import { landingQueriesApiSlice } from '../api/queries/landing.queries';
import onboardingSlice from './slices/onboarding.slice';
import { organizationMutationApiSlice } from '../api/mutations/organization.mutations';
import { organizationQueriesApiSlice } from '../api/queries/organization.queries';
import batchSlice from './slices/batch.slice';
import { batchQueriesApiSlice } from '../api/queries/batch.queries';
import { batchMutationsApiSlice } from '../api/mutations/batch.mutations';
import { authQueriesApiSlice } from '../api/queries/auth.queries';
import { businessPlanQueriesApiSlice } from '../api/queries/businessPlan.queries';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    [authMutationApiSlice.reducerPath]: authMutationApiSlice.reducer,
    [ordersMutationApiSlice.reducerPath]: ordersMutationApiSlice.reducer,
    [externalMutationsApiSlice.reducerPath]: externalMutationsApiSlice.reducer,
    [orderAssignmentsMutationsApiSlice.reducerPath]:
      orderAssignmentsMutationsApiSlice.reducer,
    [orderAssignmentQueriesApiSlice.reducerPath]:
      orderAssignmentQueriesApiSlice.reducer,
    order: orderSlice,
    orderAssignment: orderAssignmentSlice,
    orderActivity: orderActivitySlice,
    batch: batchSlice,
    [ordersQueriesApiSlice.reducerPath]: ordersQueriesApiSlice.reducer,
    [orderActivityQueriesApiSlice.reducerPath]:
      orderActivityQueriesApiSlice.reducer,
    sidebar: sidebarSlice,
    [paymentsQueriesApiSlice.reducerPath]: paymentsQueriesApiSlice.reducer,
    payment: paymentSlice,
    [paymentsMutationsApiSlice.reducerPath]: paymentsMutationsApiSlice.reducer,
    [usersQueriesApiSlice.reducerPath]: usersQueriesApiSlice.reducer,
    [usersMutationsApiSlice.reducerPath]: usersMutationsApiSlice.reducer,
    [dashboardQueriesApiSlice.reducerPath]: dashboardQueriesApiSlice.reducer,
    [landingQueriesApiSlice.reducerPath]: landingQueriesApiSlice.reducer,
    onboarding: onboardingSlice,
    [organizationMutationApiSlice.reducerPath]: organizationMutationApiSlice.reducer,
    [organizationQueriesApiSlice.reducerPath]: organizationQueriesApiSlice.reducer,
    [batchQueriesApiSlice.reducerPath]: batchQueriesApiSlice.reducer,
    [batchMutationsApiSlice.reducerPath]: batchMutationsApiSlice.reducer,
    [authQueriesApiSlice.reducerPath]: authQueriesApiSlice.reducer,
    [businessPlanQueriesApiSlice.reducerPath]: businessPlanQueriesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authMutationApiSlice.middleware,
      ordersMutationApiSlice.middleware,
      ordersQueriesApiSlice.middleware,
      externalMutationsApiSlice.middleware,
      orderAssignmentsMutationsApiSlice.middleware,
      orderAssignmentQueriesApiSlice.middleware,
      orderActivityQueriesApiSlice.middleware,
      paymentsQueriesApiSlice.middleware,
      paymentsMutationsApiSlice.middleware,
      usersQueriesApiSlice.middleware,
      usersMutationsApiSlice.middleware,
      dashboardQueriesApiSlice.middleware,
      landingQueriesApiSlice.middleware,
      organizationMutationApiSlice.middleware,
      organizationQueriesApiSlice.middleware,
      batchQueriesApiSlice.middleware,
      batchMutationsApiSlice.middleware,
      authQueriesApiSlice.middleware,
      businessPlanQueriesApiSlice.middleware,
    ),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
