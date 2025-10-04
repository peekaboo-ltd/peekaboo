import { configureStore } from '@reduxjs/toolkit';
import { ordersMutationApiSlice } from '../api/mutations/orders.mutations';
import orderSlice from './slices/order.slice';
import { ordersQueriesApiSlice } from '../api/queries/orders.queries';
import { externalMutationsApiSlice } from '../api/mutations/external.mutations';
import { orderAssignmentsMutationsApiSlice } from '../api/mutations/orderAssignments.mutations';
import orderActivitySlice from './slices/orderActivity.slice';
import { orderActivityQueriesApiSlice } from '../api/queries/orderActivity.queries';
import authSlice from './slices/auth.slice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [ordersMutationApiSlice.reducerPath]: ordersMutationApiSlice.reducer,
    [externalMutationsApiSlice.reducerPath]: externalMutationsApiSlice.reducer,
    [orderAssignmentsMutationsApiSlice.reducerPath]: orderAssignmentsMutationsApiSlice.reducer,
    order: orderSlice,
    orderActivity: orderActivitySlice,
    [ordersQueriesApiSlice.reducerPath]: ordersQueriesApiSlice.reducer,
    [orderActivityQueriesApiSlice.reducerPath]: orderActivityQueriesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ordersMutationApiSlice.middleware,
      ordersQueriesApiSlice.middleware,
      externalMutationsApiSlice.middleware,
      orderAssignmentsMutationsApiSlice.middleware,
      orderActivityQueriesApiSlice.middleware,
    ),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
