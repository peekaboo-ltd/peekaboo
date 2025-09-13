import { configureStore } from '@reduxjs/toolkit';
import { ordersMutationApiSlice } from '../api/mutations/orders.mutations';
import orderSlice from './slices/order.slice';
import { ordersQueriesApiSlice } from '../api/queries/orders.queries';
import { externalMutationsApiSlice } from '../api/mutations/external.mutations';

export const store = configureStore({
  reducer: {
    [ordersMutationApiSlice.reducerPath]: ordersMutationApiSlice.reducer,
    [externalMutationsApiSlice.reducerPath]: externalMutationsApiSlice.reducer,
    order: orderSlice,
    [ordersQueriesApiSlice.reducerPath]: ordersQueriesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ordersMutationApiSlice.middleware,
      ordersQueriesApiSlice.middleware,
      externalMutationsApiSlice.middleware,
    ),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
