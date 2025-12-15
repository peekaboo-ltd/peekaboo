import { configureStore } from '@reduxjs/toolkit';
import { ordersMutationApiSlice } from '../api/mutations/orders.mutations';
import orderSlice from './slices/order.slice';
import { ordersQueriesApiSlice } from '../api/queries/orders.queries';
import { externalMutationsApiSlice } from '../api/mutations/external.mutations';
import { orderAssignmentsMutationsApiSlice } from '../api/mutations/orderAssignments.mutations';
import { orderAssignmentQueriesApiSlice } from '../api/queries/orderAssignment.queries';
import { orderAssignmentsQueriesApiSlice } from '../api/queries/orderAssignments.queries';
import orderAssignmentSlice from './slices/orderAssignment.slice';
import orderActivitySlice from './slices/orderActivity.slice';
import { orderActivityQueriesApiSlice } from '../api/queries/orderActivity.queries';
import authSlice from './slices/auth.slice';
import { authMutationApiSlice } from '../api/mutations/auth.mutations';
import sidebarSlice from './slices/sidebar.slice';
import { paymentsQueriesApiSlice } from '../api/queries/payments.queries';
import paymentSlice from './slices/payment.slice';
import { paymentsMutationsApiSlice } from '../api/mutations/payments.mutations';
import { usersApiSlice } from '../api/mutations/users.mutations';
import { usersQueriesApiSlice } from '../api/queries/users.queries';
import { riderLocationMutationsApiSlice } from '../api/mutations/riderLocation.mutations';
import { riderLocationQueriesApiSlice } from '../api/queries/riderLocation.queries';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authMutationApiSlice.reducerPath]: authMutationApiSlice.reducer,
    [ordersMutationApiSlice.reducerPath]: ordersMutationApiSlice.reducer,
    [externalMutationsApiSlice.reducerPath]: externalMutationsApiSlice.reducer,
    [orderAssignmentsMutationsApiSlice.reducerPath]:
      orderAssignmentsMutationsApiSlice.reducer,
    [orderAssignmentQueriesApiSlice.reducerPath]:
      orderAssignmentQueriesApiSlice.reducer,
    [orderAssignmentsQueriesApiSlice.reducerPath]:
      orderAssignmentsQueriesApiSlice.reducer,
    order: orderSlice,
    orderAssignment: orderAssignmentSlice,
    orderActivity: orderActivitySlice,
    [ordersQueriesApiSlice.reducerPath]: ordersQueriesApiSlice.reducer,
    [orderActivityQueriesApiSlice.reducerPath]:
      orderActivityQueriesApiSlice.reducer,
    sidebar: sidebarSlice,
    [paymentsQueriesApiSlice.reducerPath]: paymentsQueriesApiSlice.reducer,
    payment: paymentSlice,
    [paymentsMutationsApiSlice.reducerPath]: paymentsMutationsApiSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [usersQueriesApiSlice.reducerPath]: usersQueriesApiSlice.reducer,
    [riderLocationMutationsApiSlice.reducerPath]: riderLocationMutationsApiSlice.reducer,
    [riderLocationQueriesApiSlice.reducerPath]: riderLocationQueriesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware().concat(
      authMutationApiSlice.middleware,
      ordersMutationApiSlice.middleware,
      ordersQueriesApiSlice.middleware,
      externalMutationsApiSlice.middleware,
      orderAssignmentsMutationsApiSlice.middleware,
      orderAssignmentQueriesApiSlice.middleware,
      orderAssignmentsQueriesApiSlice.middleware,
      orderActivityQueriesApiSlice.middleware,
      paymentsQueriesApiSlice.middleware,
      paymentsMutationsApiSlice.middleware,
      usersApiSlice.middleware,
      usersQueriesApiSlice.middleware,
      riderLocationMutationsApiSlice.middleware,
      riderLocationQueriesApiSlice.middleware
    ),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
